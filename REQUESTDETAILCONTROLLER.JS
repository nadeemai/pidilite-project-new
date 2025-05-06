sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], function (Controller, MessageToast, JSONModel, History, UIComponent) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.RequestDetails", {
        onInit: function () {
            this.getRouter().getRoute("requestDetails").attachPatternMatched(this._onRouteMatched, this);
            this._initMicroProcessFlow();
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

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oModel = this.getOwnerComponent().getModel();
            const aRequests = oModel.getProperty("/requests");
            const oRequest = aRequests.find(req => req.requestNo === sRequestNo);

            if (oRequest) {
                const aPriceDetails = [
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
                ];

                const aTimelineItems = [
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
                ];

                const oViewModel = new JSONModel({
                    request: oRequest,
                    priceDetails: aPriceDetails,
                    timelineItems: aTimelineItems
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
            // Placeholder for micro process item press logic
            MessageToast.show("Micro process item pressed");
        }
    });
});
