
UPDATED CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent",
    "sap/ui/core/library"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, History, Fragment, UIComponent, coreLibrary) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.RequestDetails", {
        onInit: function () {
            // Inject CSS for boldStatusText
            const sStyle = ".boldStatusText { font-weight: bold !important; }";
            const oStyleElement = document.createElement("style");
            oStyleElement.type = "text/css";
            oStyleElement.appendChild(document.createTextNode(sStyle));
            document.head.appendChild(oStyleElement);

            // Initialize view model
            const oViewModel = new JSONModel({
                request: {},
                priceDetails: [],
                timelineItems: [],
                microProcessItems: [],
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0,
                editable: true
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Update counts and initialize micro process flow
            this._updateCounts();
            this._initMicroProcessFlow();

            // Attach route matched handler
            this.getRouter().getRoute("requestDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        _initMicroProcessFlow: function () {
            const oMicroProcessFlow = this.byId("microProcessFlow");
            if (oMicroProcessFlow) {
                const aItems = oMicroProcessFlow.getContent();
                aItems.forEach(function (oItem) {
                    oItem.addStyleClass("customProcessStep");
                });
            }
        },

        _updateCounts: function () {
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];

            const oCounts = {
                draftCount: aRequests.filter(r => r.status === "Draft").length,
                sentBackCount: aRequests.filter(r => r.status === "Send Back").length,
                rejectedCount: aRequests.filter(r => r.status === "Rejected").length,
                inProgressCount: aRequests.filter(r => r.status === "Pending Request").length,
                approvedCount: aRequests.filter(r => r.status === "Approved").length,
                allCount: aRequests.length
            };

            oComponentModel.setProperty("/draftCount", oCounts.draftCount);
            oComponentModel.setProperty("/sentBackCount", oCounts.sentBackCount);
            oComponentModel.setProperty("/rejectedCount", oCounts.rejectedCount);
            oComponentModel.setProperty("/inProgressCount", oCounts.inProgressCount);
            oComponentModel.setProperty("/approvedCount", oCounts.approvedCount);
            oComponentModel.setProperty("/allCount", oCounts.allCount);
        },

        _addTimelineItem: function (sAction, sStatus) {
            const oComponentModel = this.getOwnerComponent().getModel();
            const aTimelineItems = oComponentModel.getProperty("/timelineItems") || [];
            const oDateFormat = DateFormat.getDateTimeInstance({ style: "medium" });
            const sCurrentDateTime = oDateFormat.format(new Date());
            const sUserName = "Current User";

            const oNewTimelineItem = {
                dateTime: sCurrentDateTime,
                title: `${sUserName} ${sAction} the Request [${sStatus.toUpperCase()}]`,
                text: `Request ${sStatus.toLowerCase()} by ${sUserName}.`,
                userName: sUserName,
                userPicture: `https://ui-avatars.com/api/?name=${sUserName.replace(/\s+/g, '+')}`,
                status: "Information"
            };

            aTimelineItems.unshift(oNewTimelineItem);
            oComponentModel.setProperty("/timelineItems", aTimelineItems);

            // Update view model
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/timelineItems", aTimelineItems);
        },

        _updateMicroProcessFlow: function (sStatus) {
            const oComponentModel = this.getOwnerComponent().getModel();
            let aMicroProcessItems = oComponentModel.getProperty("/microProcessItems") || [];

            // Update micro process items based on status
            aMicroProcessItems = aMicroProcessItems.map((item, index) => {
                if (sStatus === "Draft" && index === 0) {
                    return { ...item, state: "Success" };
                } else if (sStatus === "Pending Request" && index <= 1) {
                    return { ...item, state: "Success" };
                } else if (sStatus === "Approved" && index <= 2) {
                    return { ...item, state: "Success" };
                } else if (sStatus === "Send Back" && index === 1) {
                    return { ...item, state: "Warning" };
                } else if (sStatus === "Rejected" && index === 1) {
                    return { ...item, state: "Error" };
                }
                return item;
            });

            oComponentModel.setProperty("/microProcessItems", aMicroProcessItems);
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
        },

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oComponentModel = this.getOwnerComponent().getModel();

            if (!oComponentModel) {
                MessageToast.show("Component model not found");
                this.onNavBack();
                return;
            }

            const aRequests = oComponentModel.getProperty("/requests") || [];
            const oRequest = aRequests.find(req => req.requestNo === sRequestNo);

            if (oRequest) {
                const aPriceDetails = oComponentModel.getProperty("/priceDetails") || [];
                const aTimelineItems = oComponentModel.getProperty("/timelineItems") || [];
                const aMicroProcessItems = oComponentModel.getProperty("/microProcessItems") || [];

                const oViewModel = this.getView().getModel("viewModel");
                oViewModel.setProperty("/request", { ...oRequest });
                oViewModel.setProperty("/priceDetails", aPriceDetails);
                oViewModel.setProperty("/timelineItems", aTimelineItems);
                oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
                oViewModel.setProperty("/editable", true);

                // Update micro process flow based on request status
                this._updateMicroProcessFlow(oRequest.status);
            } else {
                MessageToast.show(`Request ${sRequestNo} not found`);
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

        onCreatePress: function () {
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/newRequest", {
                type: "",
                description: "",
                file: null
            });
            oViewModel.setProperty("/uploadedFiles", []);
            oViewModel.setProperty("/uploadedFilesCount", 0);
            this.byId("createRequestDialog").open();
        },

        onCreateRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oNewRequest = oViewModel.getProperty("/newRequest");
            const aUploadedFiles = oViewModel.getProperty("/uploadedFiles");

            if (aUploadedFiles.length === 0) {
                MessageBox.error("Please upload at least one file before creating the request.");
                return;
            }

            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests");
            const iNewId = aRequests.length + 1;
            const sNewRequestNo = "RM" + String(iNewId).padStart(7, "0");

            const oDateFormat = DateFormat.getDateInstance({ style: "medium" });
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
            oComponentModel.setProperty("/requests", aRequests);

            this._updateCounts();
            this._addTimelineItem("Created", "Draft");

            this.byId("createRequestDialog").close();
            MessageToast.show("Request created successfully");

            this.getRouter().navTo("requestDetails", {
                requestNo: sNewRequestNo
            });
        },

        onCancelCreate: function () {
            this.byId("createRequestDialog").close();
        },

        onSaveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            // Validate mandatory fields
            if (!oRequest.referenceNo || !oRequest.division) {
                MessageBox.error("Please fill all mandatory fields: Reference No and Division.");
                return;
            }

            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = { ...aRequests[iIndex], ...oRequest };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Updated", "Saved");
                MessageToast.show("Request saved successfully");
            } else {
                MessageBox.error("Error saving request: Request not found");
            }
        },

        onSendBackRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = {
                    ...aRequests[iIndex],
                    status: "Send Back",
                    pendingWith: oRequest.createdBy,
                    remarks: "Sent back for revision"
                };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Sent Back", "Send Back");
                this._updateMicroProcessFlow("Send Back");
                MessageToast.show("Request sent back successfully");
                this.onNavBack();
            } else {
                MessageBox.error("Error sending back request: Request not found");
            }
        },

        onRejectRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = {
                    ...aRequests[iIndex],
                    status: "Rejected",
                    pendingWith: "",
                    remarks: "Request rejected"
                };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Rejected", "Rejected");
                this._updateMicroProcessFlow("Rejected");
                MessageToast.show("Request rejected successfully");
                this.onNavBack();
            } else {
                MessageBox.error("Error rejecting request: Request not found");
            }
        },

        onApproveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = {
                    ...aRequests[iIndex],
                    status: "Approved",
                    pendingWith: "",
                    remarks: "Request approved"
                };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Approved", "Approved");
                this._updateMicroProcessFlow("Approved");
                MessageToast.show("Request approved successfully");
                this.onNavBack();
            } else {
                MessageBox.error("Error approving request: Request not found");
            }
        },

        handleUploadComplete: function (oEvent) {
            const sResponse = oEvent.getParameters().response;
            const iHttpStatusCode = parseInt(/\d{3}/.exec(sResponse) ? /\d{3}/.exec(sResponse)[0] : 0);
            const sMessage = iHttpStatusCode === 200 ? "File upload complete (Success)" : "File upload failed (Error)";
            MessageToast.show(sMessage);
        },

        handleValueChange: function (oEvent) {
            const sFileName = oEvent.getParameter("newValue");
            const oViewModel = this.getView().getModel("viewModel");
            const aUploadedFiles = oViewModel.getProperty("/uploadedFiles");
            aUploadedFiles.push({ fileName: sFileName });
            oViewModel.setProperty("/uploadedFiles", aUploadedFiles);
            oViewModel.setProperty("/uploadedFilesCount", aUploadedFiles.length);
            MessageToast.show("File selected: " + sFileName);
        },

        onDownloadFile: function (oEvent) {
            const oItem = oEvent.getSource().getBindingContext("viewModel").getObject();
            MessageToast.show("Downloading file: " + oItem.fileName);
        },

        handleTypeMissmatch: function (oEvent) {
            const aFileTypes = oEvent.getSource().getFileType().map(sType => "*." + sType);
            MessageToast.show(`The file type *.${oEvent.getParameter("fileType")} is not supported. Choose one of the following types: ${aFileTypes.join(", ")}`);
        },

        onDetailsTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            const oViewModel = this.getView().getModel("viewModel");
            const oComponentModel = this.getOwnerComponent().getModel();

            if (sKey === "priceDetails") {
                oViewModel.setProperty("/priceDetails", oComponentModel.getProperty("/priceDetails") || []);
            } else if (sKey === "timeline") {
                oViewModel.setProperty("/timelineItems", oComponentModel.getProperty("/timelineItems") || []);
            }

            MessageToast.show(`Selected tab: ${sKey}`);
        },

        onMicroProcessItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const sTooltip = oItem.getTooltip();

            if (!this._oOrderStatusDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.pidilite.pidilite.view.OrderStatusDialog",
                    controller: this
                }).then(oDialog => {
                    this._oOrderStatusDialog = oDialog;
                    this.getView().addDependent(this._oOrderStatusDialog);
                    this._updateOrderStatusDialog(sTooltip);
                    this._oOrderStatusDialog.open();
                }).catch(() => {
                    MessageBox.error("Error loading dialog");
                });
            } else {
                this._updateOrderStatusDialog(sTooltip);
                this._oOrderStatusDialog.open();
            }
        },

        _updateOrderStatusDialog: function (sTooltip) {
            if (this._oOrderStatusDialog) {
                const oTitle = this._oOrderStatusDialog.getContent()[0].getItems()[0].getItems()[1];
                const oText = this._oOrderStatusDialog.getContent()[0].getItems()[1];
                oTitle.setText(sTooltip);
                oText.setText(`Details for ${sTooltip}`);
            }
        },

        onCloseOrderStatus: function () {
            if (this._oOrderStatusDialog) {
                this._oOrderStatusDialog.close();
            }
        }
    });
});


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent",
    "sap/ui/core/library"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, History, Fragment, UIComponent, coreLibrary) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.RequestDetails", {
        onInit: function () {
            // Inject CSS for boldStatusText
            const sStyle = ".boldStatusText { font-weight: bold !important; }";
            const oStyleElement = document.createElement("style");
            oStyleElement.type = "text/css";
            oStyleElement.appendChild(document.createTextNode(sStyle));
            document.head.appendChild(oStyleElement);

            // Initialize component model
            const oData = {
                draftCount: 0,
                sentBackCount: 0,
                rejectedCount: 0,
                inProgressCount: 0,
                approvedCount: 0,
                allCount: 0,
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
                        userName: "Vikrant SIr",
                        userPicture: "https://ui-avatars.com/api/?name=VikrantSIr",
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
                        userPicture: "https://ui-avatars.com/api/?name=YugalSir",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Suraj Sir added a note [APPROVED]",
                        text: "ok",
                        userName: "Suraj Sir",
                        userPicture: "https://ui-avatars.com/api/?name=SurajSir",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ravindra Kumar added a note [APPROVED]",
                        text: "ok",
                        userName: "Ravindra Kumar",
                        userPicture: "https://ui-avatars.com/api/?name=RavindraKumar",
                        status: "Information"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Vikash Sir added a note [APPROVED]",
                        text: "ok",
                        userName: "Vikash Sir",
                        userPicture: "https://ui-avatars.com/api/?name=VikashSir",
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
                        endDate: "04-07-2025",
                        defaultPrice: "X"
                    },
                    {
                        material: "FC88B7866",
                        priceList: "04",
                        priceListDescription: "Price Lot 04",
                        uom: "EA",
                        indicativeMRP: "42.00",
                        startDate: "23-05-2025",
                        endDate: "02-07-2025",
                        defaultPrice: "X"
                    },
                    {
                        material: "FC88B7866",
                        priceList: "04",
                        priceListDescription: "Price Lot 04",
                        uom: "EA",
                        indicativeMRP: "71.09",
                        startDate: "03-05-2025",
                        endDate: "11-07-2025",
                        defaultPrice: "X"
                    }
                ],
                microProcessItems: [
                    {
                        state: "Success",
                        text: "①",
                        tooltip: "Step 1: Request Created"
                    },
                    {
                        state: "Warning",
                        text: "②",
                        tooltip: "Step 2: First Approval"
                    },
                    {
                        state: "Error",
                        text: "③",
                        tooltip: "Step 3: Final Approval"
                    }
                ]
            };

            const oComponentModel = new JSONModel(oData);
            this.getOwnerComponent().setModel(oComponentModel);

            // Initialize view model
            const oViewModel = new JSONModel({
                request: {},
                priceDetails: [],
                timelineItems: [],
                microProcessItems: [],
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0,
                editable: true
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Update counts and initialize micro process flow
            this._updateCounts();
            this._initMicroProcessFlow();

            // Attach route matched handler
            this.getRouter().getRoute("requestDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        _initMicroProcessFlow: function () {
            const oMicroProcessFlow = this.byId("microProcessFlow");
            if (oMicroProcessFlow) {
                const aItems = oMicroProcessFlow.getContent();
                aItems.forEach(function (oItem) {
                    oItem.addStyleClass("customProcessStep");
                });
            }
        },

        _updateCounts: function () {
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];

            const oCounts = {
                draftCount: aRequests.filter(r => r.status === "Draft").length,
                sentBackCount: aRequests.filter(r => r.status === "Send Back").length,
                rejectedCount: aRequests.filter(r => r.status === "Rejected").length,
                inProgressCount: aRequests.filter(r => r.status === "Pending Request").length,
                approvedCount: aRequests.filter(r => r.status === "Approved").length,
                allCount: aRequests.length
            };

            oComponentModel.setProperty("/draftCount", oCounts.draftCount);
            oComponentModel.setProperty("/sentBackCount", oCounts.sentBackCount);
            oComponentModel.setProperty("/rejectedCount", oCounts.rejectedCount);
            oComponentModel.setProperty("/inProgressCount", oCounts.inProgressCount);
            oComponentModel.setProperty("/approvedCount", oCounts.approvedCount);
            oComponentModel.setProperty("/allCount", oCounts.allCount);
        },

        _addTimelineItem: function (sAction, sStatus) {
            const oComponentModel = this.getOwnerComponent().getModel();
            const aTimelineItems = oComponentModel.getProperty("/timelineItems") || [];
            const oDateFormat = DateFormat.getDateTimeInstance({ style: "medium" });
            const sCurrentDateTime = oDateFormat.format(new Date());
            const sUserName = "Current User"; // Replace with actual user name in a real app

            const oNewTimelineItem = {
                dateTime: sCurrentDateTime,
                title: `${sUserName} ${sAction} the Request [${sStatus.toUpperCase()}]`,
                text: `Request ${sStatus.toLowerCase()} by ${sUserName}.`,
                userName: sUserName,
                userPicture: `https://ui-avatars.com/api/?name=${sUserName.replace(/\s+/g, '+')}`,
                status: "Information"
            };

            aTimelineItems.unshift(oNewTimelineItem);
            oComponentModel.setProperty("/timelineItems", aTimelineItems);

            // Update view model
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/timelineItems", aTimelineItems);
        },

        _updateMicroProcessFlow: function (sStatus) {
            const oComponentModel = this.getOwnerComponent().getModel();
            let aMicroProcessItems = oComponentModel.getProperty("/microProcessItems") || [];

            // Update micro process items based on status
            aMicroProcessItems = aMicroProcessItems.map((item, index) => {
                if (sStatus === "Draft" && index === 0) {
                    return { ...item, state: "Success" };
                } else if (sStatus === "Pending Request" && index <= 1) {
                    return { ...item, state: "Success" };
                } else if (sStatus === "Approved" && index <= 2) {
                    return { ...item, state: "Success" };
                } else if (sStatus === "Send Back" && index === 1) {
                    return { ...item, state: "Warning" };
                } else if (sStatus === "Rejected" && index === 1) {
                    return { ...item, state: "Error" };
                }
                return item;
            });

            oComponentModel.setProperty("/microProcessItems", aMicroProcessItems);
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
        },

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oComponentModel = this.getOwnerComponent().getModel();

            if (!oComponentModel) {
                MessageToast.show("Component model not found");
                this.onNavBack();
                return;
            }

            const aRequests = oComponentModel.getProperty("/requests") || [];
            const oRequest = aRequests.find(req => req.requestNo === sRequestNo);

            if (oRequest) {
                const aPriceDetails = oComponentModel.getProperty("/priceDetails") || [];
                const aTimelineItems = oComponentModel.getProperty("/timelineItems") || [];
                const aMicroProcessItems = oComponentModel.getProperty("/microProcessItems") || [];

                const oViewModel = this.getView().getModel("viewModel");
                oViewModel.setProperty("/request", { ...oRequest });
                oViewModel.setProperty("/priceDetails", aPriceDetails);
                oViewModel.setProperty("/timelineItems", aTimelineItems);
                oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
                oViewModel.setProperty("/editable", true);

                // Update micro process flow based on request status
                this._updateMicroProcessFlow(oRequest.status);
            } else {
                MessageToast.show(`Request ${sRequestNo} not found`);
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

        onCreatePress: function () {
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/newRequest", {
                type: "",
                description: "",
                file: null
            });
            oViewModel.setProperty("/uploadedFiles", []);
            oViewModel.setProperty("/uploadedFilesCount", 0);
            this.byId("createRequestDialog").open();
        },

        onCreateRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oNewRequest = oViewModel.getProperty("/newRequest");
            const aUploadedFiles = oViewModel.getProperty("/uploadedFiles");

            if (aUploadedFiles.length === 0) {
                MessageBox.error("Please upload at least one file before creating the request.");
                return;
            }

            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests");
            const iNewId = aRequests.length + 1;
            const sNewRequestNo = "RM" + String(iNewId).padStart(7, "0");

            const oDateFormat = DateFormat.getDateInstance({ style: "medium" });
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
            oComponentModel.setProperty("/requests", aRequests);

            this._updateCounts();
            this._addTimelineItem("Created", "Draft");

            this.byId("createRequestDialog").close();
            MessageToast.show("Request created successfully");

            this.getRouter().navTo("requestDetails", {
                requestNo: sNewRequestNo
            });
        },

        onCancelCreate: function () {
            this.byId("createRequestDialog").close();
        },

        onSaveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            // Validate mandatory fields
            if (!oRequest.referenceNo || !oRequest.division) {
                MessageBox.error("Please fill all mandatory fields: Reference No and Division.");
                return;
            }

            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = { ...aRequests[iIndex], ...oRequest };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Updated", "Saved");
                MessageToast.show("Request saved successfully");
            } else {
                MessageBox.error("Error saving request: Request not found");
            }
        },

        onSendBackRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = {
                    ...aRequests[iIndex],
                    status: "Send Back",
                    pendingWith: oRequest.createdBy,
                    remarks: "Sent back for revision"
                };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Sent Back", "Send Back");
                this._updateMicroProcessFlow("Send Back");
                MessageToast.show("Request sent back successfully");
                this.onNavBack();
            } else {
                MessageBox.error("Error sending back request: Request not found");
            }
        },

        onRejectRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = {
                    ...aRequests[iIndex],
                    status: "Rejected",
                    pendingWith: "",
                    remarks: "Request rejected"
                };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Rejected", "Rejected");
                this._updateMicroProcessFlow("Rejected");
                MessageToast.show("Request rejected successfully");
                this.onNavBack();
            } else {
                MessageBox.error("Error rejecting request: Request not found");
            }
        },

        onApproveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");
            const oComponentModel = this.getOwnerComponent().getModel();
            const aRequests = oComponentModel.getProperty("/requests") || [];
            const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

            if (iIndex >= 0) {
                aRequests[iIndex] = {
                    ...aRequests[iIndex],
                    status: "Approved",
                    pendingWith: "",
                    remarks: "Request approved"
                };
                oComponentModel.setProperty("/requests", aRequests);
                this._updateCounts();
                this._addTimelineItem("Approved", "Approved");
                this._updateMicroProcessFlow("Approved");
                MessageToast.show("Request approved successfully");
                this.onNavBack();
            } else {
                MessageBox.error("Error approving request: Request not found");
            }
        },

        handleUploadComplete: function (oEvent) {
            const sResponse = oEvent.getParameters().response;
            const iHttpStatusCode = parseInt(/\d{3}/.exec(sResponse) ? /\d{3}/.exec(sResponse)[0] : 0);
            const sMessage = iHttpStatusCode === 200 ? "File upload complete (Success)" : "File upload failed (Error)";
            MessageToast.show(sMessage);
        },

        handleValueChange: function (oEvent) {
            const sFileName = oEvent.getParameter("newValue");
            const oViewModel = this.getView().getModel("viewModel");
            const aUploadedFiles = oViewModel.getProperty("/uploadedFiles");
            aUploadedFiles.push({ fileName: sFileName });
            oViewModel.setProperty("/uploadedFiles", aUploadedFiles);
            oViewModel.setProperty("/uploadedFilesCount", aUploadedFiles.length);
            MessageToast.show("File selected: " + sFileName);
        },

        onDownloadFile: function (oEvent) {
            const oItem = oEvent.getSource().getBindingContext("viewModel").getObject();
            MessageToast.show("Downloading file: " + oItem.fileName);
        },

        handleTypeMissmatch: function (oEvent) {
            const aFileTypes = oEvent.getSource().getFileType().map(sType => "*." + sType);
            MessageToast.show(`The file type *.${oEvent.getParameter("fileType")} is not supported. Choose one of the following types: ${aFileTypes.join(", ")}`);
        },

        onDetailsTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            const oViewModel = this.getView().getModel("viewModel");
            const oComponentModel = this.getOwnerComponent().getModel();

            if (sKey === "priceDetails") {
                oViewModel.setProperty("/priceDetails", oComponentModel.getProperty("/priceDetails") || []);
            } else if (sKey === "timeline") {
                oViewModel.setProperty("/timelineItems", oComponentModel.getProperty("/timelineItems") || []);
            }

            MessageToast.show(`Selected tab: ${sKey}`);
        },

        onMicroProcessItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const sTooltip = oItem.getTooltip();

            if (!this._oOrderStatusDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.pidilite.pidilite.view.OrderStatusDialog",
                    controller: this
                }).then(oDialog => {
                    this._oOrderStatusDialog = oDialog;
                    this.getView().addDependent(this._oOrderStatusDialog);
                    this._updateOrderStatusDialog(sTooltip);
                    this._oOrderStatusDialog.open();
                }).catch(() => {
                    MessageBox.error("Error loading dialog");
                });
            } else {
                this._updateOrderStatusDialog(sTooltip);
                this._oOrderStatusDialog.open();
            }
        },

        _updateOrderStatusDialog: function (sTooltip) {
            if (this._oOrderStatusDialog) {
                const oTitle = this._oOrderStatusDialog.getContent()[0].getItems()[0].getItems()[1];
                const oText = this._oOrderStatusDialog.getContent()[0].getItems()[1];
                oTitle.setText(sTooltip);
                oText.setText(`Details for ${sTooltip}`);
            }
        },

        onCloseOrderStatus: function () {
            if (this._oOrderStatusDialog) {
                this._oOrderStatusDialog.close();
            }
        }
    });
});
