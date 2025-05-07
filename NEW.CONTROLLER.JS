
UPDAED CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/UIComponent"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, UIComponent) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.PidiliteProject", {
        onInit: function () {
            // Initialize view model for filter, counts, and create request
            const oViewModel = new JSONModel({
                filter: {
                    requestNo: "",
                    createdBy: "",
                    createdOn: "",
                    status: ""
                },
                draftCount: 0,
                sentBackCount: 0,
                rejectedCount: 0,
                inProgressCount: 0,
                approvedCount: 0,
                allCount: 0,
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Initialize component model with provided data
            const oComponentData = {
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
                requests: [
                    {
                        requestNo: "RM0000001",
                        createdBy: "Buyer1",
                        createdOn: "Feb 02, 2025",
                        status: "Pending Request",
                        remarks: "Awaiting approval",
                        pendingWith: "Manager1",
                        requestAging: "10 Days",
                        referenceNo: "RM0000001",
                        division: "Division 1",
                        dcnrForm: "Form 123",
                        standardReason: "Price Adjustment",
                        salesGroup: "Group A",
                        creatorComment: "Urgent request",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000002",
                        createdBy: "Buyer2",
                        createdOn: "Feb 03, 2025",
                        status: "Pending Request",
                        remarks: "Under review",
                        pendingWith: "Manager2",
                        requestAging: "8 Days",
                        referenceNo: "RM0000002",
                        division: "Division 2",
                        dcnrForm: "Form 124",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Needs quick approval",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000003",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM0000003",
                        division: "Division 1",
                        dcnrForm: "Form 125",
                        standardReason: "Price Update",
                        salesGroup: "Group A",
                        creatorComment: "Draft in progress",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000004",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM0000004",
                        division: "Division 1",
                        dcnrForm: "Form 125",
                        standardReason: "Price Update",
                        salesGroup: "Group A",
                        creatorComment: "Draft in progress",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000005",
                        createdBy: "Buyer4",
                        createdOn: "Feb 04, 2025",
                        status: "Send Back",
                        remarks: "Needs revision",
                        pendingWith: "Buyer4",
                        requestAging: "5 Days",
                        referenceNo: "RM0000005",
                        division: "Division 3",
                        dcnrForm: "Form 126",
                        standardReason: "Price Correction",
                        salesGroup: "Group C",
                        creatorComment: "Sent back for updates",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000006",
                        createdBy: "Buyer4",
                        createdOn: "Feb 04, 2025",
                        status: "Send Back",
                        remarks: "Needs revision",
                        pendingWith: "Buyer4",
                        requestAging: "5 Days",
                        referenceNo: "RM0000006",
                        division: "Division 3",
                        dcnrForm: "Form 126",
                        standardReason: "Price Correction",
                        salesGroup: "Group C",
                        creatorComment: "Sent back for updates",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000007",
                        createdBy: "Buyer5",
                        createdOn: "Jan 30, 2025",
                        status: "Rejected",
                        remarks: "Invalid data",
                        pendingWith: "-",
                        requestAging: "15 Days",
                        referenceNo: "RM0000007",
                        division: "Division 2",
                        dcnrForm: "Form 127",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Request rejected",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000008",
                        createdBy: "Buyer5",
                        createdOn: "Jan 30, 2025",
                        status: "Rejected",
                        remarks: "Invalid data",
                        pendingWith: "-",
                        requestAging: "15 Days",
                        referenceNo: "RM0000008",
                        division: "Division 2",
                        dcnrForm: "Form 127",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Request rejected",
                        dcnrTo: "Finance",
                        attachments: []
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
                ]
            };
            const oComponentModel = new JSONModel(oComponentData);
            this.getOwnerComponent().setModel(oComponentModel);

            // Update counts from component model
            this._updateCounts();
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        _updateCounts: function () {
            const oComponentModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel("viewModel");
            const aRequests = oComponentModel.getData().requests || [];

            const oCounts = {
                draftCount: aRequests.filter(r => r.status === "Draft").length,
                sentBackCount: aRequests.filter(r => r.status === "Send Back").length,
                rejectedCount: aRequests.filter(r => r.status === "Rejected").length,
                inProgressCount: aRequests.filter(r => r.status === "Pending Request").length,
                approvedCount: aRequests.filter(r => r.status === "Approved").length,
                allCount: aRequests.length
            };

            oViewModel.setProperty("/draftCount", oCounts.draftCount);
            oViewModel.setProperty("/sentBackCount", oCounts.sentBackCount);
            oViewModel.setProperty("/rejectedCount", oCounts.rejectedCount);
            oViewModel.setProperty("/inProgressCount", oCounts.inProgressCount);
            oViewModel.setProperty("/approvedCount", oCounts.approvedCount);
            oViewModel.setProperty("/allCount", oCounts.allCount);
        },

        onTilePress: function (oEvent) {
            const sHeader = oEvent.getSource().getHeader();
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");

            let aFilters = [];
            switch (sHeader) {
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

        onFilterChange: function () {
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");
            const oViewModel = this.getView().getModel("viewModel");
            const oFilters = oViewModel.getProperty("/filter");

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

        onClearFilters: function () {
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filter", {
                requestNo: "",
                createdBy: "",
                createdOn: "",
                status: ""
            });

            this.onFilterChange();
            MessageToast.show("Filters cleared");
        },

        onItemPress: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oContext = oItem.getBindingContext();
            const oData = oContext.getObject();

            this.getRouter().navTo("requestDetails", {
                requestNo: oData.requestNo
            });
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
            const aRequests = oComponentModel.getData().requests || [];
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
            oComponentModel.setData({ ...oComponentModel.getData(), requests: aRequests });

            this._updateCounts();
            this.byId("createRequestDialog").close();
            MessageToast.show("Request created successfully");

            this.getRouter().navTo("requestDetails", {
                requestNo: sNewRequestNo
            });
        },

        onCancelCreate: function () {
            this.byId("createRequestDialog").close();
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

        handleTypeMissmatch: function (oEvent) {
            const aFileTypes = oEvent.getSource().getFileType().map(sType => "*." + sType);
            MessageToast.show(`The file type *.${oEvent.getParameter("fileType")} is not supported. Choose one of the following types: ${aFileTypes.join(", ")}`);
        }
    });
});


OLD CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/UIComponent"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, UIComponent) {
    "use strict";

    return Controller.extend("com.pidilite.pidilite.controller.PidiliteProject", {
        onInit: function () {
            // Initialize view model for filter, counts, and create request
            const oViewModel = new JSONModel({
                filter: {
                    requestNo: "",
                    createdBy: "",
                    createdOn: "",
                    status: ""
                },
                draftCount: 0,
                sentBackCount: 0,
                rejectedCount: 0,
                inProgressCount: 0,
                approvedCount: 0,
                allCount: 0,
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Initialize component model with provided data
            const oComponentData = {
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
                requests: [
                    {
                        requestNo: "RM0000001",
                        createdBy: "Buyer1",
                        createdOn: "Feb 02, 2025",
                        status: "Pending Request",
                        remarks: "Awaiting approval",
                        pendingWith: "Manager1",
                        requestAging: "10 Days",
                        referenceNo: "RM0000001",
                        division: "Division 1",
                        dcnrForm: "Form 123",
                        standardReason: "Price Adjustment",
                        salesGroup: "Group A",
                        creatorComment: "Urgent request",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000002",
                        createdBy: "Buyer2",
                        createdOn: "Feb 03, 2025",
                        status: "Pending Request",
                        remarks: "Under review",
                        pendingWith: "Manager2",
                        requestAging: "8 Days",
                        referenceNo: "RM0000002",
                        division: "Division 2",
                        dcnrForm: "Form 124",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Needs quick approval",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000003",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM0000003",
                        division: "Division 1",
                        dcnrForm: "Form 125",
                        standardReason: "Price Update",
                        salesGroup: "Group A",
                        creatorComment: "Draft in progress",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000004",
                        createdBy: "Buyer3",
                        createdOn: "Feb 01, 2025",
                        status: "Draft",
                        remarks: "-",
                        pendingWith: "-",
                        requestAging: "12 Days",
                        referenceNo: "RM0000004",
                        division: "Division 1",
                        dcnrForm: "Form 125",
                        standardReason: "Price Update",
                        salesGroup: "Group A",
                        creatorComment: "Draft in progress",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000005",
                        createdBy: "Buyer4",
                        createdOn: "Feb 04, 2025",
                        status: "Send Back",
                        remarks: "Needs revision",
                        pendingWith: "Buyer4",
                        requestAging: "5 Days",
                        referenceNo: "RM0000005",
                        division: "Division 3",
                        dcnrForm: "Form 126",
                        standardReason: "Price Correction",
                        salesGroup: "Group C",
                        creatorComment: "Sent back for updates",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000006",
                        createdBy: "Buyer4",
                        createdOn: "Feb 04, 2025",
                        status: "Send Back",
                        remarks: "Needs revision",
                        pendingWith: "Buyer4",
                        requestAging: "5 Days",
                        referenceNo: "RM0000006",
                        division: "Division 3",
                        dcnrForm: "Form 126",
                        standardReason: "Price Correction",
                        salesGroup: "Group C",
                        creatorComment: "Sent back for updates",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000007",
                        createdBy: "Buyer5",
                        createdOn: "Jan 30, 2025",
                        status: "Rejected",
                        remarks: "Invalid data",
                        pendingWith: "-",
                        requestAging: "15 Days",
                        referenceNo: "RM0000007",
                        division: "Division 2",
                        dcnrForm: "Form 127",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Request rejected",
                        dcnrTo: "Finance",
                        attachments: []
                    },
                    {
                        requestNo: "RM0000008",
                        createdBy: "Buyer5",
                        createdOn: "Jan 30, 2025",
                        status: "Rejected",
                        remarks: "Invalid data",
                        pendingWith: "-",
                        requestAging: "15 Days",
                        referenceNo: "RM0000008",
                        division: "Division 2",
                        dcnrForm: "Form 127",
                        standardReason: "Price Change",
                        salesGroup: "Group B",
                        creatorComment: "Request rejected",
                        dcnrTo: "Finance",
                        attachments: []
                    }
                ]
            };
            const oComponentModel = new JSONModel(oComponentData);
            this.getOwnerComponent().setModel(oComponentModel);

            // Update counts from component model
            this._updateCounts();
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        _updateCounts: function () {
            const oComponentModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel("viewModel");
            const aRequests = oComponentModel.getData().requests || [];

            const oCounts = {
                draftCount: aRequests.filter(r => r.status === "Draft").length,
                sentBackCount: aRequests.filter(r => r.status === "Send Back").length,
                rejectedCount: aRequests.filter(r => r.status === "Rejected").length,
                inProgressCount: aRequests.filter(r => r.status === "Pending Request").length,
                approvedCount: aRequests.filter(r => r.status === "Approved").length,
                allCount: aRequests.length
            };

            oViewModel.setProperty("/draftCount", oCounts.draftCount);
            oViewModel.setProperty("/sentBackCount", oCounts.sentBackCount);
            oViewModel.setProperty("/rejectedCount", oCounts.rejectedCount);
            oViewModel.setProperty("/inProgressCount", oCounts.inProgressCount);
            oViewModel.setProperty("/approvedCount", oCounts.approvedCount);
            oViewModel.setProperty("/allCount", oCounts.allCount);
        },

        onTilePress: function (oEvent) {
            const sHeader = oEvent.getSource().getHeader();
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");

            let aFilters = [];
            switch (sHeader) {
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

        onFilterChange: function () {
            const oTable = this.byId("dashboardTable");
            const oBinding = oTable.getBinding("items");
            const oViewModel = this.getView().getModel("viewModel");
            const oFilters = oViewModel.getProperty("/filter");

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

        onClearFilters: function () {
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filter", {
                requestNo: "",
                createdBy: "",
                createdOn: "",
                status: ""
            });

            this.onFilterChange();
            MessageToast.show("Filters cleared");
        },

        onItemPress: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oContext = oItem.getBindingContext();
            const oData = oContext.getObject();

            this.getRouter().navTo("requestDetails", {
                requestNo: oData.requestNo
            });
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
            const aRequests = oComponentModel.getData().requests || [];
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
            oComponentModel.setData({ ...oComponentModel.getData(), requests: aRequests });

            this._updateCounts();
            this.byId("createRequestDialog").close();
            MessageToast.show("Request created successfully");

            this.getRouter().navTo("requestDetails", {
                requestNo: sNewRequestNo
            });
        },

        onCancelCreate: function () {
            this.byId("createRequestDialog").close();
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

        handleTypeMissmatch: function (oEvent) {
            const aFileTypes = oEvent.getSource().getFileType().map(sType => "*." + sType);
            MessageToast.show(`The file type *.${oEvent.getParameter("fileType")} is not supported. Choose one of the following types: ${aFileTypes.join(", ")}`);
        }
    });
});
