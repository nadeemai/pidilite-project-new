sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/core/library"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, History, UIComponent, coreLibrary) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.PidiliteProject", {
        onInit: function () {
            const oData = {
                draftCount: 0,
                sentBackCount: 1,
                rejectedCount: 1,
                inProgressCount: 2,
                approvedCount: 0,
                allCount: 4,
                editable: false,
                showRequestDetails: false,
                filter: {
                    requestNo: "",
                    createdBy: "",
                    createdOn: "",
                    status: ""
                },
                statusItems: [
                    { key: "", text: "All" },
                    { key: "Draft", text: "Draft" },
                    { key: "Send Back", text: "Send Back" },
                    { key: "Rejected", text: "Rejected" },
                    { key: "Pending Request", text: "Pending Request" },
                    { key: "Approved", text: "Approved" }
                ],
                requestTypes: [
                    { key: "TYPE1", text: "Type 1 Request" },
                    { key: "TYPE2", text: "Type 2 Request" },
                    { key: "TYPE3", text: "Type 3 Request" }
                ],
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0,
                requests: [
                    { 
                        requestNo: "RM00000001",
                        createdBy: "Buyer1",
                        createdOn: "Feb 02, 2025",
                        status: "Pending Request",
                        remarks: "Awaiting approval",
                        pendingWith: "Manager1",
                        requestAging: "10 Days",
                        referenceNo: "RM00000001",
                        division: "Division 1",
                        dcnrForm: "Form 123",
                        standardReason: "Price Adjustment",
                        salesGroup: "Group A",
                        creatorComment: "Urgent request",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000002",
                        createdBy: "Buyer2",
                        createdOn: "Feb 03, 2025",
                        status: "Pending Request",
                        remarks: "Under review",
                        pendingWith: "Manager2",
                        requestAging: "8 Days",
                        referenceNo: "RM00000002",
                        division: "Division 2",
                        dcnrForm: "Form 124",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Needs quick approval",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000003",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM00000003",
                        division: "Division 1",
                        dcnrForm: "Form 125",
                        standardReason: "Price Update",
                        salesGroup: "Group A",
                        creatorComment: "Draft in progress",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000004,",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM00000004,",
                        division: "Division 1",
                        dcnrForm: "Form 125",
                        standardReason: "Price Update",
                        salesGroup: "Group A",
                        creatorComment: "Draft in progress",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000005",
                        createdBy: "Buyer4",
                        createdOn: "Feb 04, 2025",
                        status: "Send Back",
                        remarks: "Needs revision",
                        pendingWith: "Buyer4",
                        requestAging: "5 Days",
                        referenceNo: "RM00000005",
                        division: "Division 3",
                        dcnrForm: "Form 126",
                        standardReason: "Price Correction",
                        salesGroup: "Group C",
                        creatorComment: "Sent back for updates",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000006",
                        createdBy: "Buyer4",
                        createdOn: "Feb 04, 2025",
                        status: "Send Back",
                        remarks: "Needs revision",
                        pendingWith: "Buyer4",
                        requestAging: "5 Days",
                        referenceNo: "RM00000006",
                        division: "Division 3",
                        dcnrForm: "Form 126",
                        standardReason: "Price Correction",
                        salesGroup: "Group C",
                        creatorComment: "Sent back for updates",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000007",
                        createdBy: "Buyer5",
                        createdOn: "Jan 30, 2025",
                        status: "Rejected",
                        remarks: "Invalid data",
                        pendingWith: "-",
                        requestAging: "15 Days",
                        referenceNo: "RM00000007",
                        division: "Division 2",
                        dcnrForm: "Form 127",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Request rejected",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    { 
                        requestNo: "RM00000008",
                        createdBy: "Buyer5",
                        createdOn: "Jan 30, 2025",
                        status: "Rejected",
                        remarks: "Invalid data",
                        pendingWith: "-",
                        requestAging: "15 Days",
                        referenceNo: "RM00000008",
                        division: "Division 2",
                        dcnrForm: "Form 127",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Request rejected",
                        dcnrTo: "Finance",
                        attachments: []
                    }
                ],
                approvers: [
                    {
                        role1: "Approver 1",
                        approver1: "ayush.jha@sumo",
                        role2: "Alternate Approver 1",
                        approver2: "tani.singh@sumo"
                    },
                    {
                        role1: "Approver 2",
                        approver1: "ayushi.khanolkar@sumo",
                        role2: "Alternate Approver 2",
                        approver2: "aakib.mohd@sumo"
                    },
                    {
                        role1: "Approver 3",
                        approver1: "yugal.kishore@sumo",
                        role2: "Alternate Approver 3",
                        approver2: "sumit.jhadjiyal@sumo"
                    }
                ],
                timelineItems: [
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Pushpak Jha Sir Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Pushpak Jha Sir",
                        userPicture: "https://ui-avatars.com/api/?name=PushpakJhaSir",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ankit Patilak Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Ankit Patilak",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Patilak",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Aakib Sir Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Aakib Sir",
                        userPicture: "https://ui-avatars.com/api/?name=AakibSir",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Vikrant SIr Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Virkrant SIr",
                        userPicture: "https://ui-avatars.com/api/?name=VikranSir",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayush Sir Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Ayush Sir",
                        userPicture: "https://ui-avatars.com/api/?name=AyushSir",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Tanu Mam Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Tanu Mam",
                        userPicture: "https://ui-avatars.com/api/?name=TanuMam",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ishan Created a Request",
                        text: "PLEASE go through and evaluate.",
                        userName: "Ishan",
                        userPicture: "https://ui-avatars.com/api/?name=Ishan",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 5:00 PM",
                        title: "Ayushi Mam added a note [APPROVED]",
                        text: "OK",
                        userName: "Ayushi Mam",
                        userPicture: "https://ui-avatars.com/api/?name=AyushiMam",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Pushkar Jha added a note [APPROVED]",
                        text: "Done",
                        userName: "Pushkar Jha",
                        userPicture: "https://ui-avatars.com/api/?name=PushkarJha",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Subham D added a note [Approved]",
                        text: "Done.",
                        userName: "Subham D",
                        userPicture: "https://ui-avatars.com/api/?name=SubhamD",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Yugal Sir added a note [APPROVED]",
                        text: "ok",
                        userName: "Yugal Sir",
                        userPicture: "https://ui-avatars.com/api/?name=Yugal",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Suraj Sir added a note [APPROVED]",
                        text: "ok",
                        userName: "Suraj Sir",
                        userPicture: "https://ui-avatars.com/api/?name=Suraj",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ravindra Kumar added a note [APPROVED]",
                        text: "ok",
                        userName: "Ravindra Kumar Sir",
                        userPicture: "https://ui-avatars.com/api/?name=Ravindra",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Vikash Sir added a note [APPROVED]",
                        text: "ok",
                        userName: "Vikash Sir Sir",
                        userPicture: "https://ui-avatars.com/api/?name=Vikash",
                        status: "Information"
                    }
                ],
                priceDetails: [
                    {
                        material: "FC88B7866",
                        priceList: "04",
                        priceListDescription: "Price Lot 04",
                        uom: "EA",
                        indicativeMRP: "41.00",
                        startDate: "13-05-2025",
                        endDate: "24-07-2025",
                        defaultPrice: "X"
                    },
                    {
                        material: "FC88B7866",
                        priceList: "04",
                        priceListDescription: "Price Lot 04",
                        uom: "EA",
                        indicativeMRP: "41.00",
                        startDate: "18-05-2025",
                        endDate: "4-07-2025",
                        defaultPrice: "X"
                    },
                    {
                        material: "FC88B7866",
                        priceList: "04",
                        priceListDescription: "Price Lot 04",
                        uom: "EA",
                        indicativeMRP: "42.00",
                        startDate: "23-05-2025",
                        endDate: "2-07-2025",
                        defaultPrice: "X"
                    },
                    {
                        material: "FC88B7866",
                        priceList: "04",
                        priceListDescription: "Price Lot 04",
                        uom: "EA",
                        indicativeMRP: "71.09",
                        startDate: "3-05-2025",
                        endDate: "11-07-2025",
                        defaultPrice: "X"
                    }
                ],
                microProcessItems: [
                    { 
                        state: "Success", 
                        text: "③",
                        tooltip: "Step 1: Request Created"
                    },
                    { 
                        state: "Success", 
                        text: "④",
                        tooltip: "Step 2: First Approval"
                    },
                    { 
                        state: "Success", 
                        text: "⑤",
                        tooltip: "Step 3: Final Approval"
                    }
                ],
                selectedRequest: {}
            };

            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel);
            this._updateCounts();
            this._initMicroProcessFlow();
        },

        _initMicroProcessFlow: function() {
            const oMicroProcessFlow = this.byId("microProcessFlow");
            if (oMicroProcessFlow) {
                const aItems = oMicroProcessFlow.getContent();
                aItems.forEach(function(oItem) {
                    oItem.addStyleClass("customProcessStep");
                });
            }
        },

        onTilePress: function(oEvent) {
            const sHeader = oEvent.getSource().getHeader();
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");
            
            let aFilters = [];
            switch(sHeader) {
                case "My Draft Requests":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Draft"));
                    break;
                case "Sent Back Requests":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Send Back"));
                    break;
                case "Rejected Requests":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Rejected"));
                    break;
                case "In-Progress Requests":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Pending Request"));
                    break;
                case "Approved Requests":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Approved"));
                    break;
                case "All Requests":
                    aFilters = [];
                    break;
            }
            
            oBinding.filter(aFilters);
            MessageToast.show(`Filtered by ${sHeader}`);
        },

        onFilterChange: function() {
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");
            const oModel = this.getView().getModel();
            const oFilters = oModel.getProperty("/filter");
            
            let aFilters = [];
            
            if (oFilters.requestNo) {
                aFilters.push(new Filter("requestNo", FilterOperator.Contains, oFilters.requestNo));
            }
            
            if (oFilters.createdBy) {
                aFilters.push(new Filter("createdBy", FilterOperator.Contains, oFilters.createdBy));
            }
            
            if (oFilters.createdOn) {
                aFilters.push(new Filter("createdOn", FilterOperator.EQ, oFilters.createdOn));
            }
            
            if (oFilters.status) {
                aFilters.push(new Filter("status", FilterOperator.EQ, oFilters.status));
            }
            
            oBinding.filter(aFilters);
        },

        onClearFilters: function() {
            const oModel = this.getView().getModel();
            oModel.setProperty("/filter", {
                requestNo: "",
                createdBy: "",
                createdOn: "",
                status: ""
            });
            
            this.onFilterChange();
            MessageToast.show("Filters cleared");
        },

        onCreatePress: function() {
            this.getView().getModel().setProperty("/newRequest", {
                type: "",
                description: "",
                file: null
            });
            
            this.byId("createRequestDialog").open();
        },

        onCreateRequest: function() {
            const oModel = this.getView().getModel();
            const oNewRequest = oModel.getProperty("/newRequest");
            const aUploadedFiles = oModel.getProperty("/uploadedFiles");
            
            const aRequests = oModel.getProperty("/requests");
            const iNewId = aRequests.length + 1;
            const sNewRequestNo = "RM" + String(iNewId).padStart(7, "0");
            
            const oDateFormat = DateFormat.getDateInstance({style: "medium"});
            const sCurrentDate = oDateFormat.format(new Date());
            
            const oRequest = {
                requestNo: sNewRequestNo,
                createdBy: "Current User",
                createdOn: sCurrentDate,
                status: "Draft",
                remarks: oNewRequest.description || "-",
                pendingWith: "-",
                requestAging: "0 Days",
                referenceNo: sNewRequestNo,
                division: "",
                dcnrForm: "",
                standardReason: "",
                salesGroup: "",
                creatorComment: "",
                dcnrTo: "",
                attachments: aUploadedFiles.map(file => ({ fileName: file.fileName }))
            };
            
            aRequests.unshift(oRequest);
            oModel.setProperty("/requests", aRequests);
            
            this._updateCounts();
            
            this.byId("createRequestDialog").close();
            MessageToast.show("Request created successfully");
            
            oModel.setProperty("/selectedRequest", JSON.parse(JSON.stringify(oRequest)));
            oModel.setProperty("/showRequestDetails", true);
            
            const oTabBar = this.byId("requestsTabBar");
            oTabBar.setSelectedKey("requestDetails");
        },

        onCancelCreate: function() {
            this.byId("createRequestDialog").close();
        },

        onItemPress: function(oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oContext = oItem.getBindingContext();
            const oData = oContext.getObject();
            
            const oSelectedRequest = JSON.parse(JSON.stringify(oData));
            const oModel = this.getView().getModel();
            oModel.setProperty("/selectedRequest", oSelectedRequest);
            oModel.setProperty("/showRequestDetails", true);
            
            const oTabBar = this.byId("requestsTabBar");
            oTabBar.setSelectedKey("requestDetails");
        },

        onSaveRequest: function() {
            const oModel = this.getView().getModel();
            const oSelectedRequest = oModel.getProperty("/selectedRequest");
            
            const aRequests = oModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oSelectedRequest.requestNo);
            if (iIndex >= 0) {
                aRequests[iIndex] = oSelectedRequest;
                oModel.setProperty("/requests", aRequests);
            }
            
            MessageToast.show("Request saved successfully");
        },

        onSendBackRequest: function() {
            const oModel = this.getView().getModel();
            const oSelectedRequest = oModel.getProperty("/selectedRequest");
            
            oSelectedRequest.status = "Send Back";
            oSelectedRequest.pendingWith = "";
            
            const aRequests = oModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oSelectedRequest.requestNo);
            if (iIndex >= 0) {
                aRequests[iIndex] = oSelectedRequest;
                oModel.setProperty("/requests", aRequests);
            }
            
            this._updateCounts();
            oModel.setProperty("/showRequestDetails", false);
            MessageToast.show("Request sent back successfully");
            
            const oTabBar = this.byId("requestsTabBar");
            oTabBar.setSelectedKey("all");
        },

        onRejectRequest: function() {
            const oModel = this.getView().getModel();
            const oSelectedRequest = oModel.getProperty("/selectedRequest");
            
            oSelectedRequest.status = "Rejected";
            oSelectedRequest.pendingWith = "";
            
            const aRequests = oModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oSelectedRequest.requestNo);
            if (iIndex >= 0) {
                aRequests[iIndex] = oSelectedRequest;
                oModel.setProperty("/requests", aRequests);
            }
            
            this._updateCounts();
            oModel.setProperty("/showRequestDetails", false);
            MessageToast.show("Request rejected successfully");
            
            const oTabBar = this.byId("requestsTabBar");
            oTabBar.setSelectedKey("all");
        },

        onApproveRequest: function() {
            const oModel = this.getView().getModel();
            const oSelectedRequest = oModel.getProperty("/selectedRequest");
            
            oSelectedRequest.status = "Approved";
            oSelectedRequest.pendingWith = "";
            
            const aRequests = oModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oSelectedRequest.requestNo);
            if (iIndex >= 0) {
                aRequests[iIndex] = oSelectedRequest;
                oModel.setProperty("/requests", aRequests);
            }
            
            this._updateCounts();
            oModel.setProperty("/showRequestDetails", false);
            MessageToast.show("Request approved successfully");
            
            const oTabBar = this.byId("requestsTabBar");
            oTabBar.setSelectedKey("all");
        },

        handleUploadComplete: function(oEvent) {
            const sResponse = oEvent.getParameters().response;
            const iHttpStatusCode = parseInt(/\d{3}/.exec(sResponse) ? /\d{3}/.exec(sResponse)[0] : 0);
            const sMessage = iHttpStatusCode === 200 ? "File upload complete (Success)" : "File upload failed (Error)";
            MessageToast.show(sMessage);
        },

        handleValueChange: function(oEvent) {
            const sFileName = oEvent.getParameter("newValue");
            const oModel = this.getView().getModel();
            const aUploadedFiles = oModel.getProperty("/uploadedFiles");
            aUploadedFiles.push({ fileName: sFileName });
            oModel.setProperty("/uploadedFiles", aUploadedFiles);
            oModel.setProperty("/uploadedFilesCount", aUploadedFiles.length);
            MessageToast.show("File selected: " + sFileName);
        },

        onDownloadFile: function(oEvent) {
            const oItem = oEvent.getSource().getBindingContext().getObject();
            MessageToast.show("Downloading file: " + oItem.fileName);
        },

        handleTypeMissmatch: function(oEvent) {
            const aFileTypes = oEvent.getSource().getFileType().map(sType => "*." + sType);
            MessageToast.show(`The file type *.${oEvent.getParameter("fileType")} is not supported. Choose one of the following types: ${aFileTypes.join(", ")}`);
        },

        _updateCounts: function() {
            const oModel = this.getView().getModel();
            const aRequests = oModel.getProperty("/requests");
            
            const oCounts = {
                draftCount: aRequests.filter(r => r.status === "Draft").length,
                sentBackCount: aRequests.filter(r => r.status === "Send Back").length,
                rejectedCount: aRequests.filter(r => r.status === "Rejected").length,
                inProgressCount: aRequests.filter(r => r.status === "Pending Request").length,
                approvedCount: aRequests.filter(r => r.status === "Approved").length,
                allCount: aRequests.length
            };
            
            oModel.setProperty("/draftCount", oCounts.draftCount);
            oModel.setProperty("/sentBackCount", oCounts.sentBackCount);
            oModel.setProperty("/rejectedCount", oCounts.rejectedCount);
            oModel.setProperty("/inProgressCount", oCounts.inProgressCount);
            oModel.setProperty("/approvedCount", oCounts.approvedCount);
            oModel.setProperty("/allCount", oCounts.allCount);
        },

        onTabSelect: function(oEvent) {
            const sKey = oEvent.getParameter("key");
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([]);
            MessageToast.show(`Selected tab: ${sKey}`);
        },

        onDetailsTabSelect: function(oEvent) {
            const sKey = oEvent.getParameter("key");
            MessageToast.show(`Selected details tab: ${sKey}`);
        },

        onMicroProcessItemPress: function(oEvent) {
            this.byId("orderStatusDialog").open();
        },

        onCloseOrderStatus: function() {
            this.byId("orderStatusDialog").close();
        }
    });
});
