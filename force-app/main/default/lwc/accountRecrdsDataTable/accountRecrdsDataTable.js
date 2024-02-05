import { LightningElement ,api ,wire,track } from 'lwc';
import AccDetails  from  '@salesforce/apex/AccountHandlerclass.accrecrds';
import Accounts from '@salesforce/schema/Account';
import ConDetails  from  '@salesforce/apex/AccountHandlerclass.conrecrds';
import { refreshApex } from '@salesforce/apex';
import LightningModal from 'lightning/modal';
import { NavigationMixin } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';
import recordSelectedId from '@salesforce/messageChannel/MyMessageChannels';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class AccountRecrdsDataTable extends NavigationMixin(LightningElement) {
   @track recordId;
    objectApiName = Accounts
    @track records; 
    @track Acrecord
    @track acname
    @api errors;
    @track searchitem = '';
    @track firstRecordId = '';
    @track Accid
    @track conrecords 
    @track columns = [{
        label: 'contact name',
        fieldName: 'LastName',
        type: 'text',
        sortable: true
    },{
        label: 'Email',
        fieldName: 'Email',
        type: 'text',
        sortable: true
    },{
        label: 'Phone',
        fieldName: 'Phone',
        type: 'text',
        sortable: true
    },]

    contactRecords = false
    recordviewform = false;
    listofrecrds = true;
    pageSizeOptions = [5, 10, 25, 50, 75, 100];
    totalRecords = 0;
    pageSize;
    totalPages;
    pageNumber = 1;
    recordsToDisplay = [];
    isButtonDisabled = false
   
    /* @wire (AccDetails)
    wiredCases({
        data,error
    }){
    if(data){
        this.records = data;
        this.recordsToDisplay = data;
        this.totalRecords = data.length; // update total records count                 
        this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
        this.paginationHelper(); 
       console.log(this.records)
        this.errors = undefined;
    }
    if(error){
        this.errors = error;
        }
    }*/

    fetchAccDetails() {
       return AccDetails()
          .then((result) => {
            this.records = result;
            this.recordsToDisplay = result;
            console.log('uff'+this.recordsToDisplay)
            this.totalRecords = result.length; // update total records count                 
            this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
            this.paginationHelper(); 
           console.log(this.records)
          })
          .catch((error) => {
            this.error = error;
          });
      }
    AccName(event){
        this.acname = event.target.value
        console.log(this.acname)
    }
    searchAccName(event){
        this.searchitem =event.target.value
        console.log(this.searchitem)
        AccDetails({accname : this.searchitem}).then((result)=>{
            if(result != null){
                this.records = result; 
                this. recordsToDisplay = result;
                this.totalRecords = result.length; // update total records count                 
                this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                this.paginationHelper(); 
           console.log('1'+JSON.stringify(this.records))   
        //    const firstRecordId = result[0].Id;
        //    console.log('Record ID: ' + firstRecordId);
            }
        }).catch((error) => {
            console.log('error while fetch contacts--> ' + JSON.stringify(error));
        });
    }

    openaccPage(event){
        this.firstRecordId = event.target.dataset.id;
        console.log('btn call' +this.firstRecordId)
        console.log("key "+ event.target.dataset.id);
        
        console.log('Cmplted');
      this.listofrecrds = false;
       //this.recordviewform = true;
       // Navigate to View Account Page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId:this.firstRecordId,
                objectApiName: 'Account',
                //recordId:this.firstRecordId,
                actionName: 'view',
            },
        })
        .then(navigatedPageReference => {
            console.log('Page reference: ', navigatedPageReference);
        })
        .catch(error => {
            console.error('Error navigating to record page: ', error);
        });
    }
    connectedCallback() {
        this.fetchAccDetails();
    }
    closeRecordViewForm(){
        this.recordviewform = false;
        this.listofrecrds = true;
       // return refreshApex(this.recordsToDisplay);
       this.fetchAccDetails();
    }
    contactRecrds(event){
        this.recordviewform = false;
        this.listofrecrds = true;
         

        this.Accid = event.target.value
        ConDetails({accid: this.Accid}).then((result)=>{
            if(result != null && result.length >0){
                this.conrecords = result;
                this.contactRecords = true
                console.log('con'+JSON.stringify(this.conrecords))
            }
            else {
                this.conrecords = null
                const evt = new ShowToastEvent({
                                    title: "Account created",
                                    message: "No Records Found",
                                   variant: "error"
                               });
                           this.dispatchEvent(evt);
                console.log('records not found')
            }
        })
    }
    cancelmodalpopup(){
        this.contactRecords = false      
        this.listofrecrds = true;
    return refreshApex(this.recordsToDisplay);
       
    }
    showcontactrecords(){
        var message = {recordId : this.firstRecordId}
        console.log('hii')
        publish(this.messageContext, recordSelectedId, message);
    }
    
    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }
    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }
    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.records[i]);
        }
    }
    handleClear(){
      // this.AccDetails();
     //return refreshApex(this.recordsToDisplay);
     this.fetchAccDetails();
       console.log('cancel')
   }
    
/*
    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }
    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        console.log('0.1'+this.pageSize)
        this.paginationHelper();
    } 
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        console.log('0.2'+this.totalPages)
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.records.push(this.recordss[i]);
            console.log()
        }
    }*/
//         handleSuccess(event){
//             const evt = new ShowToastEvent({
//                 title: "Account created",
//                 message: "success",
//                 variant: "success"
//             });
//             this.dispatchEvent(evt);
//         }
//         handleSubmit(event){
//             this.handleSuccess(event);
// console.log('record view form')
//         }
}