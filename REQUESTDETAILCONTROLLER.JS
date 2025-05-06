sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent"
], function (Controller, MessageToast, JSONModel, History, Fragment, UIComponent) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.RequestDetails", {
        onInit: function () {
            // Initialize the model with provided data
            const oData = {
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
                        requestNo: "RM00000004",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM00000004",
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
                        dcnrForm: "Form  aggiornamento",
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

            // Attach route matched handler
            this.getRouter().getRoute("requestDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
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

        _updateCounts: function() {
            const oModel = this.getView().getModel();
            const aRequests = oModel.getProperty("/requests");
            
            const oCounts = {
                pending: aRequests.filter(req => req.status === "Pending Request").length,
                draft: aRequests.filter(req => req.status === "Draft").length,
                sendBack: aRequests.filter(req => req.status === "Send Back").length,
                rejected: aRequests.filter(req => req.status === "Rejected").length
            };
            
            oModel.setProperty("/counts", oCounts);
        },

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oModel = this.getOwnerComponent().getModel();
            const aRequests = oModel.getProperty("/requests");
            const oRequest = aRequests.find(req => req.requestNo === sRequestNo);

            if (oRequest) {
                const aPriceDetails = oModel.getProperty("/priceDetails");
                const aTimelineItems = oModel.getProperty("/timelineItems");

                const oViewModel = new JSONModel({
                    request: oRequest,
                    priceDetails: aPriceDetails,
                    timelineItems: aTimelineItems,
                    editable: true
                });
                this.getView().setModel(oViewModel);
            } else {
                MessageToast.show("Request not found");
                this.onNavBack();
            }
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("dashboard", {}, true);
            }
        },

        onSaveRequest: function () {
            const oModel = this.getView().getModel();
            const oRequest = oModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = oRequest;
                oComponentModel.setProperty("/requests", aRequests);
                MessageToast.show("Request saved successfully");
            } else {
                MessageToast.show("Error saving request");
            }
        },

        onSendBackRequest: function() {
            const oModel = this.getView().getModel();
            const oRequest = oModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex].status = "Send Back";
                aRequests[iIndex].pendingWith = "";
                oComponentModel.setProperty("/requests", aRequests);
                MessageToast.show("Request sent back successfully");
                this.onNavBack();
            } else {
                MessageToast.show("Error sending back request");
            }
        },

        onRejectRequest: function() {
            const oModel = this.getView().getModel();
            const oRequest = oModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex].status = "Rejected";
                aRequests[iIndex].pendingWith = "";
                oComponentModel.setProperty("/requests", aRequests);
                MessageToast.show("Request rejected successfully");
                this.onNavBack();
            } else {
                MessageToast.show("Error rejecting request");
            }
        },

        onApproveRequest: function() {
            const oModel = this.getView().getModel();
            const oRequest = oModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests");
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex].status = "Approved";
                aRequests[iIndex].pendingWith = "";
                oComponentModel.setProperty("/requests", aRequests);
                MessageToast.show("Request approved successfully");
                this.onNavBack();
            } else {
                MessageToast.show("Error approving request");
            }
        },

        onDetailsTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            MessageToast.show(`Selected details tab: ${sKey}`);
        },

        onMicroProcessItemPress: function(oEvent) {
            MessageToast.show("Micro process item pressed");
        }
    });
});
