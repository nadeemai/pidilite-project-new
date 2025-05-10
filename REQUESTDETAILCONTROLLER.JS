
UPDATED CODE 4

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
    "sap/ui/core/library",
    "sap/base/Log"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, History, Fragment, UIComponent, coreLibrary, Log) {
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
                approverLog: [],
                approverList: [],
                reqSeqTracker: [],
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0,
                editable: true,
                isLoading: true,
                standardReasons: [],
                salesGroups: [],
                divisions: []
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Load static data from backend
            this._loadStaticData();

            // Initialize micro process flow data
            this._initMicroProcessFlow();

            // Attach route matched handler
            this.getRouter().getRoute("requestDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        _loadStaticData: function () {
            const oODataModel = this.getOwnerComponent().getModel("catalog");
            const oViewModel = this.getView().getModel("viewModel");

            if (!oODataModel) {
                Log.error("OData model 'catalog' not found during _loadStaticData");
                // Fallback data
                oViewModel.setProperty("/standardReasons", [
                    { key: "REASON1", text: "Price Adjustment" },
                    { key: "REASON2", text: "Price Change" },
                    { key: "REASON3", text: "Price Update" }
                ]);
                oViewModel.setProperty("/salesGroups", [
                    { key: "SG1", text: "Sales Group 1" },
                    { key: "SG2", text: "Sales Group 2" },
                    { key: "SG3", text: "Sales Group 3" }
                ]);
                oViewModel.setProperty("/divisions", [
                    { key: "DIV1", text: "Division 1" },
                    { key: "DIV2", text: "Division 2" },
                    { key: "DIV3", text: "Division 3" }
                ]);
                return;
            }

            // Load Standard Reasons
            const oStandardReasonsBinding = oODataModel.bindList("/StandardReasons");
            oStandardReasonsBinding.requestContexts(0, 100).then(function (aContexts) {
                const aStandardReasons = aContexts.map(oContext => {
                    const oData = oContext.getObject();
                    return {
                        key: oData.reasonCode,
                        text: oData.reasonDescription
                    };
                });
                oViewModel.setProperty("/standardReasons", aStandardReasons.length > 0 ? aStandardReasons : [
                    { key: "REASON1", text: "Price Adjustment" },
                    { key: "REASON2", text: "Price Change" },
                    { key: "REASON3", text: "Price Update" }
                ]);
            }).catch(function (oError) {
                Log.error("Failed to fetch Standard Reasons: " + oError.message);
                oViewModel.setProperty("/standardReasons", [
                    { key: "REASON1", text: "Price Adjustment" },
                    { key: "REASON2", text: "Price Change" },
                    { key: "REASON3", text: "Price Update" }
                ]);
            });

            // Load Sales Groups
            const oSalesGroupsBinding = oODataModel.bindList("/SalesGroups");
            oSalesGroupsBinding.requestContexts(0, 100).then(function (aContexts) {
                const aSalesGroups = aContexts.map(oContext => {
                    const oData = oContext.getObject();
                    return {
                        key: oData.salesGroupCode,
                        text: oData.salesGroupDescription
                    };
                });
                oViewModel.setProperty("/salesGroups", aSalesGroups.length > 0 ? aSalesGroups : [
                    { key: "SG1", text: "Sales Group 1" },
                    { key: "SG2", text: "Sales Group 2" },
                    { key: "SG3", text: "Sales Group 3" }
                ]);
            }).catch(function (oError) {
                Log.error("Failed to fetch Sales Groups: " + oError.message);
                oViewModel.setProperty("/salesGroups", [
                    { key: "SG1", text: "Sales Group 1" },
                    { key: "SG2", text: "Sales Group 2" },
                    { key: "SG3", text: "Sales Group 3" }
                ]);
            });

            // Load Divisions
            const oDivisionsBinding = oODataModel.bindList("/Divisions");
            oDivisionsBinding.requestContexts(0, 100).then(function (aContexts) {
                const aDivisions = aContexts.map(oContext => {
                    const oData = oContext.getObject();
                    return {
                        key: oData.divisionCode,
                        text: oData.divisionDescription
                    };
                });
                oViewModel.setProperty("/divisions", aDivisions.length > 0 ? aDivisions : [
                    { key: "DIV1", text: "Division 1" },
                    { key: "DIV2", text: "Division 2" },
                    { key: "DIV3", text: "Division 3" }
                ]);
            }).catch(function (oError) {
                Log.error("Failed to fetch Divisions: " + oError.message);
                oViewModel.setProperty("/divisions", [
                    { key: "DIV1", text: "Division 1" },
                    { key: "DIV2", text: "Division 2" },
                    { key: "DIV3", text: "Division 3" }
                ]);
            });
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        _initMicroProcessFlow: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const aMicroProcessItems = [
                { state: "Success", tooltip: "Step 1: My Draft Request" },
                { state: "Warning", tooltip: "Step 2: Send Back Request" },
                { state: "Success", tooltip: "Step 3: Rejected Request" },
                { state: "Warning", tooltip: "Step 4: In Progress Request" },
                { state: "Error", tooltip: "Step 5: All Request" }
            ];
            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);

            const oMicroProcessFlow = this.byId("microProcessFlow");
            // if (oMicroProcessFlow) {
            //     const aItems = oMicroProcessFlow.getItems();
            //     aItems.forEach(function (oItem) {
            //         oItem.addStyleClass("customProcessStep");
            //     });
            // }
        },

        _loadMaterialPriceLot: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadMaterialPriceLot");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/priceDetails", [{
                            ID: "PD001",
                            material: "MAT001",
                            priceLot: "PL01",
                            priceLotDescription: "Standard Price Lot",
                            uom: "EA",
                            indicativeMRP: 50.00,
                            startDate: "2025-01-01",
                            endDate: "2025-12-31",
                            defaultPrice: "X"
                        }]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/MaterialPriceLot", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aPriceDetails = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                ID: oData.ID,
                                material: oData.Material,
                                priceLot: oData.PriceLot,
                                priceLotDescription: oData.PriceLotDescription,
                                uom: oData.UoM,
                                indicativeMRP: oData.IndicativeMRP,
                                startDate: oData.StartDate,
                                endDate: oData.EndDate,
                                defaultPrice: oData.DefaultPriceLotForMaterial
                            };
                        });

                        if (aPriceDetails.length === 0) {
                            aPriceDetails.push({
                                ID: "PD001",
                                material: "MAT001",
                                priceLot: "PL01",
                                priceLotDescription: "Standard Price Lot",
                                uom: "EA",
                                indicativeMRP: 50.00,
                                startDate: "2025-01-01",
                                endDate: "2025-12-31",
                                defaultPrice: "X"
                            });
                        }

                        oViewModel.setProperty("/priceDetails", aPriceDetails);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch material price lot: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/priceDetails", [{
                            ID: "PD001",
                            material: "MAT001",
                            priceLot: "PL01",
                            priceLotDescription: "Standard Price Lot",
                            uom: "EA",
                            indicativeMRP: 50.00,
                            startDate: "2025-01-01",
                            endDate: "2025-12-31",
                            defaultPrice: "X"
                        }]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadMaterialPriceLot: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/priceDetails", [{
                        ID: "PD001",
                        material: "MAT001",
                        priceLot: "PL01",
                        priceLotDescription: "Standard Price Lot",
                        uom: "EA",
                        indicativeMRP: 50.00,
                        startDate: "2025-01-01",
                        endDate: "2025-12-31",
                        defaultPrice: "X"
                    }]);
                    resolve();
                }
            });
        },

        _loadTimeline: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    const oDateFormat = DateFormat.getDateTimeInstance({ pattern: "MMM dd, yyyy, HH:mm:ss" });

                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadTimeline");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/timelineItems", [{
                            ID: "TL001",
                            requestNo: sRequestNo,
                            dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                            title: "Request Created",
                            text: "Request was created by Buyer1",
                            userName: "Buyer1",
                            userPicture: "",
                            status: "Success",
                            icon: "sap-icon://employee-approvals"
                        }]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ApproverLog", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aTimelineItems = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            let sStatus = "Neutral";
                            if (oData.status === "Approved") {
                                sStatus = "Success";
                            } else if (oData.status === "Send Back") {
                                sStatus = "Warning";
                            } else if (oData.status === "Rejected") {
                                sStatus = "Error";
                            }
                            return {
                                ID: oData.ID,
                                requestNo: oData.requestNo.requestNo,
                                dateTime: oDateFormat.format(new Date(oData.updatedOn)),
                                title: oData.status,
                                text: `${oData.role} - ${oData.approver}`,
                                userName: oData.approver,
                                userPicture: "",
                                status: sStatus,
                                icon: "sap-icon://employee-approvals"
                            };
                        });

                        if (aTimelineItems.length === 0) {
                            aTimelineItems.push({
                                ID: "TL001",
                                requestNo: sRequestNo,
                                dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                                title: "Request Created",
                                text: "Request was created by Buyer1",
                                userName: "Buyer1",
                                userPicture: "",
                                status: "Success",
                                icon: "sap-icon://employee-approvals"
                            });
                        }

                        oViewModel.setProperty("/timelineItems", aTimelineItems);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch approver log for timeline: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/timelineItems", [{
                            ID: "TL001",
                            requestNo: sRequestNo,
                            dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                            title: "Request Created",
                            text: "Request was created by Buyer1",
                            userName: "Buyer1",
                            userPicture: "",
                            status: "Success",
                            icon: "sap-icon://employee-approvals"
                        }]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadTimeline: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    const oDateFormat = DateFormat.getDateTimeInstance({ pattern: "MMM dd, yyyy, HH:mm:ss" });
                    oViewModel.setProperty("/timelineItems", [{
                        ID: "TL001",
                        requestNo: sRequestNo,
                        dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                        title: "Request Created",
                        text: "Request was created by Buyer1",
                        userName: "Buyer1",
                        userPicture: "",
                        status: "Success",
                        icon: "sap-icon://employee-approvals"
                    }]);
                    resolve();
                }
            });
        },

        _loadApproverLog: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadApproverLog");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverLog", [
                            {
                                approver: "Approver 1",
                                action: "Approved",
                                date: "2025-02-01T10:00:00Z",
                                comments: "Looks good"
                            },
                            {
                                approver: "Approver 2",
                                action: "Reviewed",
                                date: "2025-02-02T10:00:00Z",
                                comments: "Needs more info"
                            }
                        ]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ApproverLog", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aApproverLog = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                approver: oData.approver,
                                action: oData.status,
                                date: oData.updatedOn,
                                comments: oData.stage
                            };
                        });

                        if (aApproverLog.length === 0) {
                            aApproverLog.push(
                                {
                                    approver: "Approver 1",
                                    action: "Approved",
                                    date: "2025-02-01T10:00:00Z",
                                    comments: "Looks good"
                                },
                                {
                                    approver: "Approver 2",
                                    action: "Reviewed",
                                    date: "2025-02-02T10:00:00Z",
                                    comments: "Needs more info"
                                }
                            );
                        }

                        oViewModel.setProperty("/approverLog", aApproverLog);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch approver log: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverLog", [
                            {
                                approver: "Approver 1",
                                action: "Approved",
                                date: "2025-02-01T10:00:00Z",
                                comments: "Looks good"
                            },
                            {
                                approver: "Approver 2",
                                action: "Reviewed",
                                date: "2025-02-02T10:00:00Z",
                                comments: "Needs more info"
                            }
                        ]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadApproverLog: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/approverLog", [
                        {
                            approver: "Approver 1",
                            action: "Approved",
                            date: "2025-02-01T10:00:00Z",
                            comments: "Looks good"
                        },
                        {
                            approver: "Approver 2",
                            action: "Reviewed",
                            date: "2025-02-02T10:00:00Z",
                            comments: "Needs more info"
                        }
                    ]);
                    resolve();
                }
            });
        },

        _loadApproverList: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadApproverList");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverList", [
                            {
                                approver: "Approver 1",
                                role: "First Approver",
                                status: "Completed"
                            },
                            {
                                approver: "Approver 2",
                                role: "Final Approver",
                                status: "Pending"
                            }
                        ]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ApproverList", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aApproverList = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                approver: oData.approvername,
                                role: oData.approverrole,
                                status: oData.approveremail ? "Completed" : "Pending"
                            };
                        });

                        if (aApproverList.length === 0) {
                            aApproverList.push(
                                {
                                    approver: "Approver 1",
                                    role: "First Approver",
                                    status: "Completed"
                                },
                                {
                                    approver: "Approver 2",
                                    role: "Final Approver",
                                    status: "Pending"
                                }
                            );
                        }

                        oViewModel.setProperty("/approverList", aApproverList);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch approver list: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverList", [
                            {
                                approver: "Approver 1",
                                role: "First Approver",
                                status: "Completed"
                            },
                            {
                                approver: "Approver 2",
                                role: "Final Approver",
                                status: "Pending"
                            }
                        ]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadApproverList: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/approverList", [
                        {
                            approver: "Approver 1",
                            role: "First Approver",
                            status: "Completed"
                        },
                        {
                            approver: "Approver 2",
                            role: "Final Approver",
                            status: "Pending"
                        }
                    ]);
                    resolve();
                }
            });
        },

        _loadReqSeqTracker: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadReqSeqTracker");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/reqSeqTracker", [
                            {
                                sequence: "1",
                                action: "Created",
                                date: "2025-02-01T10:00:00Z",
                                user: "User1"
                            },
                            {
                                sequence: "2",
                                action: "Submitted",
                                date: "2025-02-02T10:00:00Z",
                                user: "User1"
                            }
                        ]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("reqseqTracker/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ReqSeqTracker", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aReqSeqTracker = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                sequence: oData.ReqTracker.toString(),
                                action: "Sequence " + oData.LastSeq,
                                date: new Date().toISOString(),
                                user: "User" + oData.LastSeq
                            };
                        });

                        if (aReqSeqTracker.length === 0) {
                            aReqSeqTracker.push(
                                {
                                    sequence: "1",
                                    action: "Created",
                                    date: "2025-02-01T10:00:00Z",
                                    user: "User1"
                                },
                                {
                                    sequence: "2",
                                    action: "Submitted",
                                    date: "2025-02-02T10:00:00Z",
                                    user: "User1"
                                }
                            );
                        }

                        oViewModel.setProperty("/reqSeqTracker", aReqSeqTracker);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch request sequence tracker: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/reqSeqTracker", [
                            {
                                sequence: "1",
                                action: "Created",
                                date: "2025-02-01T10:00:00Z",
                                user: "User1"
                            },
                            {
                                sequence: "2",
                                action: "Submitted",
                                date: "2025-02-02T10:00:00Z",
                                user: "User1"
                            }
                        ]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadReqSeqTracker: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/reqSeqTracker", [
                        {
                            sequence: "1",
                            action: "Created",
                            date: "2025-02-01T10:00:00Z",
                            user: "User1"
                        },
                        {
                            sequence: "2",
                            action: "Submitted",
                            date: "2025-02-02T10:00:00Z",
                            user: "User1"
                        }
                    ]);
                    resolve();
                }
            });
        },

        _loadFiles: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    const oViewModel = this.getView().getModel("viewModel");

                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadFiles");
                        oViewModel.setProperty("/uploadedFiles", [
                            { fileName: "Document1.pdf" },
                            { fileName: "Document2.pdf" }
                        ]);
                        oViewModel.setProperty("/uploadedFilesCount", 2);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/Attachments", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const aFiles = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                fileName: oData.fileName
                            };
                        });

                        if (aFiles.length === 0) {
                            aFiles.push(
                                { fileName: "Document1.pdf" },
                                { fileName: "Document2.pdf" }
                            );
                        }

                        oViewModel.setProperty("/uploadedFiles", aFiles);
                        oViewModel.setProperty("/uploadedFilesCount", aFiles.length);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch files: " + oError.message);
                        oViewModel.setProperty("/uploadedFiles", [
                            { fileName: "Document1.pdf" },
                            { fileName: "Document2.pdf" }
                        ]);
                        oViewModel.setProperty("/uploadedFilesCount", 2);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadFiles: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/uploadedFiles", [
                        { fileName: "Document1.pdf" },
                        { fileName: "Document2.pdf" }
                    ]);
                    oViewModel.setProperty("/uploadedFilesCount", 2);
                    resolve();
                }
            });
        },

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/isLoading", true);

            // Load request details first
            this._loadRequestDetails(sRequestNo).then(() => {
                // Load all related data in parallel
                return Promise.all([
                    this._loadMaterialPriceLot(sRequestNo),
                    this._loadTimeline(sRequestNo),
                    this._loadApproverLog(sRequestNo),
                    this._loadApproverList(sRequestNo),
                    this._loadReqSeqTracker(sRequestNo),
                    this._loadFiles(sRequestNo)
                ]);
            }).then(() => {
                oViewModel.setProperty("/isLoading", false);
            }).catch(oError => {
                Log.error("Failed to load request details: " + oError.message);
                oViewModel.setProperty("/isLoading", false);
                MessageBox.error("Failed to load request details. Please try again later.");
                this.onNavBack();
            });
        },

        _loadRequestDetails: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    const oViewModel = this.getView().getModel("viewModel");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadRequestDetails");
                        const oRequest = {
                            requestNo: sRequestNo,
                            createdBy: "Buyer1",
                            createdOn: "Feb 02, 2025",
                            status: "Pending Request",
                            remarks: "Awaiting approval",
                            PendingWith: "Manager1",
                            RequestAging: "10 Days",
                            dcnrFrom: 10,
                            dcnrTo: 20,
                            attachments: [],
                            referenceNo: "REF001",
                            division: "DIV1",
                            salesGroup: "SG1",
                            standardReason: "REASON1",
                            creatorComment: "Initial request"
                        };
                        const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                        oViewModel.setProperty("/request", oRequest);
                        oViewModel.setProperty("/editable", bEditable);
                        this._updateMicroProcessFlow(oRequest.status);
                        resolve();
                        return;
                    }

                    const oBinding = oODataModel.bindContext(`/Requests(${sRequestNo})`);

                    oBinding.requestObject().then(function (oData) {
                        // Ensure salesGroup is a string and matches the keys in salesGroups
                        const sSalesGroup = typeof oData.salesGroup === "string" ? oData.salesGroup : "SG1";
                        const aSalesGroups = oViewModel.getProperty("/salesGroups") || [];
                        const bValidSalesGroup = aSalesGroups.some(group => group.key === sSalesGroup);

                        // Ensure division is a string and matches the keys in divisions
                        const sDivision = typeof oData.division === "string" ? oData.division : "DIV1";
                        const aDivisions = oViewModel.getProperty("/divisions") || [];
                        const bValidDivision = aDivisions.some(division => division.key === sDivision);

                        // Ensure standardReason is a string and matches the keys in standardReasons
                        const sStandardReason = typeof oData.standardReason === "string" ? oData.standardReason : "REASON1";
                        const aStandardReasons = oViewModel.getProperty("/standardReasons") || [];
                        const bValidStandardReason = aStandardReasons.some(reason => reason.key === sStandardReason);

                        const oRequest = {
                            requestNo: oData.requestNo,
                            createdBy: oData.createdBy || "Unknown",
                            createdOn: oData.createdOn || new Date().toISOString(),
                            status: oData.status,
                            remarks: oData.remarks,
                            PendingWith: oData.PendingWith,
                            RequestAging: oData.RequestAging,
                            dcnrFrom: oData.dcnrFrom,
                            dcnrTo: oData.dcnrTo,
                            attachments: oData.attachments || [],
                            referenceNo: oData.referenceNo || "REF001",
                            division: bValidDivision ? sDivision : "DIV1", // Fallback to "DIV1" if invalid
                            salesGroup: bValidSalesGroup ? sSalesGroup : "SG1", // Fallback to "SG1" if invalid
                            standardReason: bValidStandardReason ? sStandardReason : "REASON1", // Fallback to "REASON1" if invalid
                            creatorComment: oData.creatorComment || "Initial request"
                        };

                        const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                        oViewModel.setProperty("/request", oRequest);
                        oViewModel.setProperty("/editable", bEditable);
                        this._updateMicroProcessFlow(oRequest.status);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch request details: " + oError.message);
                        const oRequest = {
                            requestNo: sRequestNo,
                            createdBy: "Buyer1",
                            createdOn: "Feb 02, 2025",
                            status: "Pending Request",
                            remarks: "Awaiting approval",
                            PendingWith: "Manager1",
                            RequestAging: "10 Days",
                            dcnrFrom: 10,
                            dcnrTo: 20,
                            attachments: [],
                            referenceNo: "REF001",
                            division: "DIV1",
                            salesGroup: "SG1",
                            standardReason: "REASON1",
                            creatorComment: "Initial request"
                        };
                        const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                        oViewModel.setProperty("/request", oRequest);
                        oViewModel.setProperty("/editable", bEditable);
                        this._updateMicroProcessFlow(oRequest.status);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadRequestDetails: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    const oRequest = {
                        requestNo: sRequestNo,
                        createdBy: "Buyer1",
                        createdOn: "Feb 02, 2025",
                        status: "Pending Request",
                        remarks: "Awaiting approval",
                        PendingWith: "Manager1",
                        RequestAging: "10 Days",
                        dcnrFrom: 10,
                        dcnrTo: 20,
                        attachments: [],
                        referenceNo: "REF001",
                        division: "DIV1",
                        salesGroup: "SG1",
                        standardReason: "REASON1",
                        creatorComment: "Initial request"
                    };
                    const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                    oViewModel.setProperty("/request", oRequest);
                    oViewModel.setProperty("/editable", bEditable);
                    this._updateMicroProcessFlow(oRequest.status);
                    resolve();
                }
            });
        },

        _updateMicroProcessFlow: function (sStatus) {
            const oViewModel = this.getView().getModel("viewModel");
            let aMicroProcessItems = oViewModel.getProperty("/microProcessItems") || [];

            if (aMicroProcessItems.length === 0) {
                aMicroProcessItems = [
                    { state: "None", tooltip: "Step 1: My Draft Request" },
                    { state: "None", tooltip: "Step 2: Send Back Request" },
                    { state: "None", tooltip: "Step 3: Rejected Request" },
                    { state: "None", tooltip: "Step 4: In Progress Request" },
                    { state: "None", tooltip: "Step 5: All Request" }
                ];
            }

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

            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
            const oMicroProcessFlow = this.byId("microProcessFlow");
            if (oMicroProcessFlow) {
                oMicroProcessFlow.getBinding("items").refresh();
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
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            if (!oRequest.referenceNo || !oRequest.division) {
                MessageBox.error("Please fill all mandatory fields: Reference No and Division.");
                return;
            }

            this._saveRequest(oRequest).then(() => {
                MessageToast.show("Request saved successfully");
                oRequest.status = "Draft";
                oViewModel.setProperty("/request", oRequest);
                this._updateMicroProcessFlow(oRequest.status);
            }).catch(oError => {
                MessageBox.error("Error saving request: " + oError.message);
            });
        },

        _saveRequest: function (oRequest) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.warning("OData model 'catalog' not found during _saveRequest. Simulating save operation.");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/request", { ...oRequest });
                        resolve();
                        return;
                    }

                    const oBinding = oODataModel.bindContext(`/Requests(${oRequest.requestNo})`);
                    oBinding.setProperty("dcnrFrom", oRequest.dcnrFrom);
                    oBinding.setProperty("dcnrTo", oRequest.dcnrTo);
                    oBinding.setProperty("remarks", oRequest.remarks);
                    oBinding.setProperty("referenceNo", oRequest.referenceNo);
                    oBinding.setProperty("division", oRequest.division);
                    oBinding.setProperty("salesGroup", oRequest.salesGroup);
                    oBinding.setProperty("standardReason", oRequest.standardReason);
                    oBinding.setProperty("creatorComment", oRequest.creatorComment);

                    oODataModel.submitBatch("updateGroup").then(() => {
                        resolve();
                    }).catch(oError => {
                        Log.error("OData save request failed: " + oError.message);
                        reject(oError);
                    });
                } catch (oError) {
                    Log.error("Error in _saveRequest: " + oError.message);
                    reject(oError);
                }
            });
        },

        onSendBackRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            this._updateRequestStatus(oRequest.requestNo, "Send Back", "Sent back for revision").then(() => {
                MessageToast.show("Request sent back successfully");
                oRequest.status = "Send Back";
                oViewModel.setProperty("/request", oRequest);
                this._updateMicroProcessFlow(oRequest.status);
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error sending back request: " + oError.message);
            });
        },

        onRejectRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            this._updateRequestStatus(oRequest.requestNo, "Rejected", "Request rejected").then(() => {
                MessageToast.show("Request rejected successfully");
                oRequest.status = "Rejected";
                oViewModel.setProperty("/request", oRequest);
                this._updateMicroProcessFlow(oRequest.status);
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error rejecting request: " + oError.message);
            });
        },

        onApproveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            this._updateRequestStatus(oRequest.requestNo, "Approved", "Request approved").then(() => {
                MessageToast.show("Request approved successfully");
                oRequest.status = "Approved";
                oViewModel.setProperty("/request", oRequest);
                this._updateMicroProcessFlow(oRequest.status);
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error approving request: " + oError.message);
            });
        },

        _updateRequestStatus: function (sRequestNo, sStatus, sRemarks) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    const oViewModel = this.getView().getModel("viewModel");

                    if (!oODataModel) {
                        Log.warning("OData model 'catalog' not found during _updateRequestStatus. Simulating status update.");
                        const oRequest = oViewModel.getProperty("/request");
                        oRequest.status = sStatus;
                        oRequest.remarks = sRemarks;
                        oRequest.PendingWith = sStatus === "Send Back" ? oRequest.createdBy : "";
                        oViewModel.setProperty("/request", oRequest);
                        resolve();
                        return;
                    }

                    const oBinding = oODataModel.bindContext(`/Requests(${sRequestNo})`);
                    oBinding.setProperty("status", sStatus);
                    oBinding.setProperty("remarks", sRemarks);
                    oBinding.setProperty("PendingWith", sStatus === "Send Back" ? oBinding.getObject().createdBy : "");

                    oODataModel.submitBatch("updateGroup").then(() => {
                        resolve();
                    }).catch(oError => {
                        Log.error("OData update request status failed: " + oError.message);
                        reject(oError);
                    });
                } catch (oError) {
                    Log.error("Error in _updateRequestStatus: " + oError.message);
                    reject(oError);
                }
            });
        },

        onDownloadFile: function (oEvent) {
            const oItem = oEvent.getSource().getBindingContext("viewModel").getObject();
            if (oItem && oItem.fileName) {
                MessageToast.show("Downloading file: " + oItem.fileName);
                const oODataModel = this.getOwnerComponent().getModel("catalog");
                if (oODataModel) {
                    Log.info("File download initiated for: " + oItem.fileName);
                }
            } else {
                MessageBox.error("No file selected for download.");
            }
        },

        onDetailsTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            MessageToast.show(`Selected tab: ${sKey}`);
        },

        onMicroProcessItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const sTooltip = oItem.getTooltip();

            if (!sTooltip) {
                MessageBox.error("No tooltip available for this item.");
                return;
            }

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
                }).catch(oError => {
                    Log.error("Error loading OrderStatusDialog: " + oError.message);
                    MessageBox.error("Error loading dialog");
                });
            } else {
                this._updateOrderStatusDialog(sTooltip);
                this._oOrderStatusDialog.open();
            }
        },

        _updateOrderStatusDialog: function (sTooltip) {
            if (this._oOrderStatusDialog) {
                const oContent = this._oOrderStatusDialog.getContent();
                if (oContent && oContent.length > 0) {
                    const oItems = oContent[0].getItems();
                    if (oItems && oItems.length >= 2) {
                        const oTitle = oItems[0].getItems()[1];
                        const oText = oItems[1];
                        oTitle.setText(sTooltip);
                        oText.setText(`Details for ${sTooltip}`);
                    } else {
                        Log.error("OrderStatusDialog content structure is incorrect.");
                    }
                } else {
                    Log.error("OrderStatusDialog has no content.");
                }
            } else {
                Log.error("OrderStatusDialog is not initialized.");
            }
        },

        onCloseOrderStatus: function () {
            if (this._oOrderStatusDialog) {
                this._oOrderStatusDialog.close();
            } else {
                MessageBox.error("Order Status Dialog not found.");
            }
        },

        // Formatter for salesGroup
        formatSalesGroup: function (sSalesGroup) {
            const oViewModel = this.getView().getModel("viewModel");
            const aSalesGroups = oViewModel.getProperty("/salesGroups") || [];
            const bValidSalesGroup = aSalesGroups.some(group => group.key === sSalesGroup);
            return bValidSalesGroup ? sSalesGroup : "SG1"; // Fallback to "SG1" if invalid
        },

        // Formatter for division
        formatDivision: function (sDivision) {
            const oViewModel = this.getView().getModel("viewModel");
            const aDivisions = oViewModel.getProperty("/divisions") || [];
            const bValidDivision = aDivisions.some(division => division.key === sDivision);
            return bValidDivision ? sDivision : "DIV1"; // Fallback to "DIV1" if invalid
        },

        // Formatter for standardReason
        formatStandardReason: function (sStandardReason) {
            const oViewModel = this.getView().getModel("viewModel");
            const aStandardReasons = oViewModel.getProperty("/standardReasons") || [];
            const bValidStandardReason = aStandardReasons.some(reason => reason.key === sStandardReason);
            return bValidStandardReason ? sStandardReason : "REASON1"; // Fallback to "REASON1" if invalid
        }
    });
});



UPDATED CODE 3

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
    "sap/ui/core/library",
    "sap/base/Log"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, History, Fragment, UIComponent, coreLibrary, Log) {
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
                approverLog: [],
                approverList: [],
                reqSeqTracker: [],
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0,
                editable: true,
                isLoading: true,
                standardReasons: [],
                salesGroups: [],
                divisions: []
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Load static data from backend
            this._loadStaticData();

            // Initialize micro process flow data
            this._initMicroProcessFlow();

            // Attach route matched handler
            this.getRouter().getRoute("requestDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        _loadStaticData: function () {
            const oODataModel = this.getOwnerComponent().getModel("catalog");
            const oViewModel = this.getView().getModel("viewModel");

            if (!oODataModel) {
                Log.error("OData model 'catalog' not found during _loadStaticData");
                // Fallback data
                oViewModel.setProperty("/standardReasons", [
                    { key: "REASON1", text: "Price Adjustment" },
                    { key: "REASON2", text: "Price Change" },
                    { key: "REASON3", text: "Price Update" }
                ]);
                oViewModel.setProperty("/salesGroups", [
                    { key: "SG1", text: "Sales Group 1" },
                    { key: "SG2", text: "Sales Group 2" },
                    { key: "SG3", text: "Sales Group 3" }
                ]);
                oViewModel.setProperty("/divisions", [
                    { key: "DIV1", text: "Division 1" },
                    { key: "DIV2", text: "Division 2" },
                    { key: "DIV3", text: "Division 3" }
                ]);
                return;
            }

            // Load Standard Reasons
            const oStandardReasonsBinding = oODataModel.bindList("/StandardReasons");
            oStandardReasonsBinding.requestContexts(0, 100).then(function (aContexts) {
                const aStandardReasons = aContexts.map(oContext => {
                    const oData = oContext.getObject();
                    return {
                        key: oData.reasonCode,
                        text: oData.reasonDescription
                    };
                });
                oViewModel.setProperty("/standardReasons", aStandardReasons.length > 0 ? aStandardReasons : [
                    { key: "REASON1", text: "Price Adjustment" },
                    { key: "REASON2", text: "Price Change" },
                    { key: "REASON3", text: "Price Update" }
                ]);
            }).catch(function (oError) {
                Log.error("Failed to fetch Standard Reasons: " + oError.message);
                oViewModel.setProperty("/standardReasons", [
                    { key: "REASON1", text: "Price Adjustment" },
                    { key: "REASON2", text: "Price Change" },
                    { key: "REASON3", text: "Price Update" }
                ]);
            });

            // Load Sales Groups
            const oSalesGroupsBinding = oODataModel.bindList("/SalesGroups");
            oSalesGroupsBinding.requestContexts(0, 100).then(function (aContexts) {
                const aSalesGroups = aContexts.map(oContext => {
                    const oData = oContext.getObject();
                    return {
                        key: oData.salesGroupCode,
                        text: oData.salesGroupDescription
                    };
                });
                oViewModel.setProperty("/salesGroups", aSalesGroups.length > 0 ? aSalesGroups : [
                    { key: "SG1", text: "Sales Group 1" },
                    { key: "SG2", text: "Sales Group 2" },
                    { key: "SG3", text: "Sales Group 3" }
                ]);
            }).catch(function (oError) {
                Log.error("Failed to fetch Sales Groups: " + oError.message);
                oViewModel.setProperty("/salesGroups", [
                    { key: "SG1", text: "Sales Group 1" },
                    { key: "SG2", text: "Sales Group 2" },
                    { key: "SG3", text: "Sales Group 3" }
                ]);
            });

            // Load Divisions
            const oDivisionsBinding = oODataModel.bindList("/Divisions");
            oDivisionsBinding.requestContexts(0, 100).then(function (aContexts) {
                const aDivisions = aContexts.map(oContext => {
                    const oData = oContext.getObject();
                    return {
                        key: oData.divisionCode,
                        text: oData.divisionDescription
                    };
                });
                oViewModel.setProperty("/divisions", aDivisions.length > 0 ? aDivisions : [
                    { key: "DIV1", text: "Division 1" },
                    { key: "DIV2", text: "Division 2" },
                    { key: "DIV3", text: "Division 3" }
                ]);
            }).catch(function (oError) {
                Log.error("Failed to fetch Divisions: " + oError.message);
                oViewModel.setProperty("/divisions", [
                    { key: "DIV1", text: "Division 1" },
                    { key: "DIV2", text: "Division 2" },
                    { key: "DIV3", text: "Division 3" }
                ]);
            });
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        _initMicroProcessFlow: function () {
            const oViewModel = this.getView().getModel("viewModel");
            // Initialize microProcessItems to match the view binding
            const aMicroProcessItems = [
                { state: "Success", tooltip: "Step 1: My Draft Request" },
                { state: "Warning", tooltip: "Step 2: Send Back Request" },
                { state: "Success", tooltip: "Step 3: Rejected Request" },
                { state: "Warning", tooltip: "Step 4: In Progress Request" },
                { state: "Error", tooltip: "Step 5: All Request" }
            ];
            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);

            const oMicroProcessFlow = this.byId("microProcessFlow");
            // if (oMicroProcessFlow) {
            //     // const aItems = oMicroProcessFlow.getItems();
            //     // aItems.forEach(function (oItem) {
            //     //     oItem.addStyleClass("customProcessStep");
            //     // });
            // }
        },

        _loadMaterialPriceLot: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadMaterialPriceLot");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/priceDetails", [{
                            ID: "PD001",
                            material: "MAT001",
                            priceLot: "PL01",
                            priceLotDescription: "Standard Price Lot",
                            uom: "EA",
                            indicativeMRP: 50.00,
                            startDate: "2025-01-01",
                            endDate: "2025-12-31",
                            defaultPrice: "X"
                        }]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/MaterialPriceLot", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aPriceDetails = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                ID: oData.ID,
                                material: oData.Material,
                                priceLot: oData.PriceLot,
                                priceLotDescription: oData.PriceLotDescription,
                                uom: oData.UoM,
                                indicativeMRP: oData.IndicativeMRP,
                                startDate: oData.StartDate,
                                endDate: oData.EndDate,
                                defaultPrice: oData.DefaultPriceLotForMaterial
                            };
                        });

                        if (aPriceDetails.length === 0) {
                            aPriceDetails.push({
                                ID: "PD001",
                                material: "MAT001",
                                priceLot: "PL01",
                                priceLotDescription: "Standard Price Lot",
                                uom: "EA",
                                indicativeMRP: 50.00,
                                startDate: "2025-01-01",
                                endDate: "2025-12-31",
                                defaultPrice: "X"
                            });
                        }

                        oViewModel.setProperty("/priceDetails", aPriceDetails);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch material price lot: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/priceDetails", [{
                            ID: "PD001",
                            material: "MAT001",
                            priceLot: "PL01",
                            priceLotDescription: "Standard Price Lot",
                            uom: "EA",
                            indicativeMRP: 50.00,
  <mvc:View controllerName="com.pidilite.pidilite.controller.RequestDetails"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m"
        xmlns:core="sap.ui.core"
        xmlns:form="sap.ui.layout.form"
        xmlns:layout="sap.ui.layout" 
        xmlns:suite="sap.suite.ui.commons"
        displayBlock="true">

    <Page id="requestDetailsPage" title="Request Details" showNavButton="true" navButtonPress="onNavBack">
        <content>
            <Panel id="requestDetailsPanel" class="sapUiSmallMargin">
                <headerToolbar>
                    <Toolbar id="requestDetailsToolbar">
                        <Title id="requestDetailsTitle" text="Request No: {/request/requestNo}"/>
                        <ToolbarSpacer id="requestDetailsSpacer"/>
                        <Button id="saveButton" text="Save" press="onSaveRequest" type="Accept" enabled="{/editable}"/>
                        <Button id="sendBackButton" text="Send Back" press="onSendBackRequest" type="Accept" enabled="{/editable}"/>
                        <Button id="rejectButton" text="Reject" press="onRejectRequest" type="Reject" enabled="{/editable}"/>
                        <Button id="approveButton" text="Approve" press="onApproveRequest" type="Accept" enabled="{/editable}"/>
                    </Toolbar>
                </headerToolbar>
                <Toolbar id="microProcessToolbar">
                    <HBox id="microProcessHBox" justifyContent="Center">
                        <suite:MicroProcessFlow id="microProcessFlow" >
                            <!-- <suite:items>
                                <suite:MicroProcessFlowItem
                                    state="{viewModel>state}"
                                    icon="sap-icon://accept"
                                    press="onMicroProcessItemPress"
                                    tooltip="{viewModel>tooltip}"/>
                            </suite:items> -->
                        </suite:MicroProcessFlow>
                    </HBox>
                </Toolbar>
                <VBox id="requestDetailsVBox">
                    <form:SimpleForm id="requestDetailsForm" layout="ResponsiveGridLayout" editable="{/editable}" labelSpanXL="4" labelSpanL="4" labelSpanM="4" labelSpanS="12">
                        <Panel id="priceRequisitionPanel" headerText="Price Requisition Details" expandable="true" expanded="true">
                            <Label id="mandatoryLabel" text="Fields marked with * are mandatory" class="sapUiSmallMarginTop mandatoryLabel"/>
                            <layout:Grid id="detailsGrid" defaultSpan="XL6 L6 M6 S12" class="sapUiSmallMargin">
                                <!-- Left Column -->
                                <VBox id="leftVBox">
                                    <Label id="referenceNoLabel" text="Reference No:*"/>
                                    <Input id="referenceNoInput" value="{/request/referenceNo}"/>
                                    <Label id="divisionLabel" text="Division:*"/>
                                    <ComboBox
                                        id="divisionComboBox"
                                        items="{viewModel>/divisions}"
                                        selectedKey="{path: '/request/division', formatter: '.formatDivision'}"
                                        enabled="{/editable}">
                                        <core:Item key="{viewModel>key}" text="{viewModel>text}"/>
                                    </ComboBox>
                                    <Label id="dcnrFormLabel" text="DCNR# form:"/>
                                    <Input id="dcnrFormInput" value="{/request/dcnrFrom}"/>
                                    <Label id="standardReasonLabel" text="Standard Reason:"/>
                                    <ComboBox
                                        id="standardReasonComboBox"
                                        items="{viewModel>/standardReasons}"
                                        selectedKey="{path: '/request/standardReason', formatter: '.formatStandardReason'}"
                                        enabled="{/editable}">
                                        <core:Item key="{viewModel>key}" text="{viewModel>text}"/>
                                    </ComboBox>
                                    <Label id="creatorCommentLabel" text="Comment by Creator:"/>
                                    <Input id="creatorCommentInput" value="{/request/creatorComment}"/>
                                </VBox>
                                <!-- Right Column -->
                                <VBox id="rightVBox">
                                    <Label id="createdByLabel" text="Created By:"/>
                                    <Text id="createdByText" text="{/request/createdBy}"/>
                                    <Label id="createdOnLabel" text="Created Date:"/>
                                    <Text id="createdOnText" text="{/request/createdOn}"/>
                                    <Label id="statusLabel" text="Status of the Request:"/>
                                    <Text id="statusText" text="{/request/status}"/>
                                    <Label id="salesGroupLabel" text="Sales Group:"/>
                                    <ComboBox
                                        id="salesGroupComboBox"
                                        items="{viewModel>/salesGroups}"
                                        selectedKey="{path: '/request/salesGroup', formatter: '.formatSalesGroup'}"
                                        enabled="{/editable}">
                                        <core:Item key="{viewModel>key}" text="{viewModel>text}"/>
                                    </ComboBox>
                                    <Label id="dcnrToLabel" text="DCNR% to:"/>
                                    <Input id="dcnrToInput" value="{/request/dcnrTo}"/>
                                </VBox>
                            </layout:Grid>
                        </Panel>
                    </form:SimpleForm>
                    <IconTabBar id="detailsTabBar" select="onDetailsTabSelect" expandable="false" class="sapUiSmallMarginTop">
                        <items>
                            <IconTabFilter id="priceDetailsTab" text="Price Details" key="priceDetails">
                                <Table id="priceDetailsTable" items="{/priceDetails}" width="100%">
                                    <columns>
                                        <Column id="materialColumn"><Text id="materialText" text="Material"/></Column>
                                        <Column id="priceLotColumn"><Text id="priceLotText" text="Price Lot"/></Column>
                                        <Column id="priceLotDescColumn"><Text id="priceLotDescText" text="Price Lot Description"/></Column>
                                        <Column id="uomColumn"><Text id="uomText" text="UoM"/></Column>
                                        <Column id="mrpColumn"><Text id="mrpText" text="Indicative MRP"/></Column>
                                        <Column id="startDateColumn"><Text id="startDateText" text="Start Date"/></Column>
                                        <Column id="endDateColumn"><Text id="endDateText" text="End Date"/></Column>
                                        <Column id="defaultPriceColumn"><Text id="defaultPriceText" text="Default Price for Lot Material"/></Column>
                                    </columns>
                                    <items>
                                        <ColumnListItem id="priceItem">
                                            <cells>
                                                <Text id="materialCell" text="{material}"/>
                                                <Text id="priceLotCell" text="{priceLot}"/>
                                                <Text id="priceLotDescCell" text="{priceLotDescription}"/>
                                                <Text id="uomCell" text="{uom}"/>
                                                <Text id="mrpCell" text="{indicativeMRP}"/>
                                                <Text id="startDateCell" text="{startDate}"/>
                                                <Text id="endDateCell" text="{endDate}"/>
                                                <Text id="defaultPriceCell" text="{defaultPrice}"/>
                                            </cells>
                                        </ColumnListItem>
                                    </items>
                                </Table>
                            </IconTabFilter>
                            <IconTabFilter id="timelineTab" text="Timeline" key="timeline">
                                <suite:Timeline 
                                    id="detailsTimeline" 
                                    enableScroll="true" 
                                    content="{/timelineItems}" 
                                    showHeaderBar="false" 
                                    enableDoubleSided="true" 
                                    axisOrientation="Horizontal" 
                                    height="500px">
                                    <suite:content>
                                        <suite:TimelineItem id="timelineItem"
                                            dateTime="{dateTime}"
                                            title="{title}"
                                            text="{text}"
                                            userName="{userName}"
                                            userPicture="{userPicture}"
                                            status="{status}"
                                            icon="sap-icon://employee-approvals"/>
                                    </suite:content>
                                </suite:Timeline>
                            </IconTabFilter>
                            <IconTabFilter id="filesTab" text="Files" key="files">
                                <Table id="filesTable" items="{viewModel>/uploadedFiles}" width="100%">
                                    <columns>
                                        <Column id="fileNameColumn"><Text id="fileNameText" text="File Name"/></Column>
                                        <Column id="fileActionColumn"><Text id="fileActionText" text="Action"/></Column>
                                    </columns>
                                    <items>
                                        <ColumnListItem id="fileItem">
                                            <cells>
                                                <Text id="fileNameCell" text="{viewModel>fileName}"/>
                                                <Button id="downloadButton" text="Download" press="onDownloadFile" type="Default"/>
                                            </cells>
                                        </ColumnListItem>
                                    </items>
                                </Table>
                            </IconTabFilter>
                        </items>
                    </IconTabBar>
                </VBox>
            </Panel>
        </content>
    </Page>
</mvc:View>                          startDate: "2025-01-01",
                            endDate: "2025-12-31",
                            defaultPrice: "X"
                        }]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadMaterialPriceLot: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/priceDetails", [{
                        ID: "PD001",
                        material: "MAT001",
                        priceLot: "PL01",
                        priceLotDescription: "Standard Price Lot",
                        uom: "EA",
                        indicativeMRP: 50.00,
                        startDate: "2025-01-01",
                        endDate: "2025-12-31",
                        defaultPrice: "X"
                    }]);
                    resolve();
                }
            });
        },

        _loadTimeline: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    const oDateFormat = DateFormat.getDateTimeInstance({ pattern: "MMM dd, yyyy, HH:mm:ss" });

                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadTimeline");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/timelineItems", [{
                            ID: "TL001",
                            requestNo: sRequestNo,
                            dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                            title: "Request Created",
                            text: "Request was created by Buyer1",
                            userName: "Buyer1",
                            userPicture: "",
                            status: "Success",
                            icon: "sap-icon://employee-approvals"
                        }]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ApproverLog", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aTimelineItems = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            let sStatus = "Neutral";
                            if (oData.status === "Approved") {
                                sStatus = "Success";
                            } else if (oData.status === "Send Back") {
                                sStatus = "Warning";
                            } else if (oData.status === "Rejected") {
                                sStatus = "Error";
                            }
                            return {
                                ID: oData.ID,
                                requestNo: oData.requestNo.requestNo,
                                dateTime: oDateFormat.format(new Date(oData.updatedOn)),
                                title: oData.status,
                                text: `${oData.role} - ${oData.approver}`,
                                userName: oData.approver,
                                userPicture: "",
                                status: sStatus,
                                icon: "sap-icon://employee-approvals"
                            };
                        });

                        if (aTimelineItems.length === 0) {
                            aTimelineItems.push({
                                ID: "TL001",
                                requestNo: sRequestNo,
                                dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                                title: "Request Created",
                                text: "Request was created by Buyer1",
                                userName: "Buyer1",
                                userPicture: "",
                                status: "Success",
                                icon: "sap-icon://employee-approvals"
                            });
                        }

                        oViewModel.setProperty("/timelineItems", aTimelineItems);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch approver log for timeline: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/timelineItems", [{
                            ID: "TL001",
                            requestNo: sRequestNo,
                            dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                            title: "Request Created",
                            text: "Request was created by Buyer1",
                            userName: "Buyer1",
                            userPicture: "",
                            status: "Success",
                            icon: "sap-icon://employee-approvals"
                        }]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadTimeline: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    const oDateFormat = DateFormat.getDateTimeInstance({ pattern: "MMM dd, yyyy, HH:mm:ss" });
                    oViewModel.setProperty("/timelineItems", [{
                        ID: "TL001",
                        requestNo: sRequestNo,
                        dateTime: oDateFormat.format(new Date("2025-02-01T10:00:00Z")),
                        title: "Request Created",
                        text: "Request was created by Buyer1",
                        userName: "Buyer1",
                        userPicture: "",
                        status: "Success",
                        icon: "sap-icon://employee-approvals"
                    }]);
                    resolve();
                }
            });
        },

        _loadApproverLog: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadApproverLog");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverLog", [
                            {
                                approver: "Approver 1",
                                action: "Approved",
                                date: "2025-02-01T10:00:00Z",
                                comments: "Looks good"
                            },
                            {
                                approver: "Approver 2",
                                action: "Reviewed",
                                date: "2025-02-02T10:00:00Z",
                                comments: "Needs more info"
                            }
                        ]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ApproverLog", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aApproverLog = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                approver: oData.approver,
                                action: oData.status,
                                date: oData.updatedOn,
                                comments: oData.stage
                            };
                        });

                        if (aApproverLog.length === 0) {
                            aApproverLog.push(
                                {
                                    approver: "Approver 1",
                                    action: "Approved",
                                    date: "2025-02-01T10:00:00Z",
                                    comments: "Looks good"
                                },
                                {
                                    approver: "Approver 2",
                                    action: "Reviewed",
                                    date: "2025-02-02T10:00:00Z",
                                    comments: "Needs more info"
                                }
                            );
                        }

                        oViewModel.setProperty("/approverLog", aApproverLog);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch approver log: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverLog", [
                            {
                                approver: "Approver 1",
                                action: "Approved",
                                date: "2025-02-01T10:00:00Z",
                                comments: "Looks good"
                            },
                            {
                                approver: "Approver 2",
                                action: "Reviewed",
                                date: "2025-02-02T10:00:00Z",
                                comments: "Needs more info"
                            }
                        ]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadApproverLog: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/approverLog", [
                        {
                            approver: "Approver 1",
                            action: "Approved",
                            date: "2025-02-01T10:00:00Z",
                            comments: "Looks good"
                        },
                        {
                            approver: "Approver 2",
                            action: "Reviewed",
                            date: "2025-02-02T10:00:00Z",
                            comments: "Needs more info"
                        }
                    ]);
                    resolve();
                }
            });
        },

        _loadApproverList: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadApproverList");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverList", [
                            {
                                approver: "Approver 1",
                                role: "First Approver",
                                status: "Completed"
                            },
                            {
                                approver: "Approver 2",
                                role: "Final Approver",
                                status: "Pending"
                            }
                        ]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("requestNo/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ApproverList", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aApproverList = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                approver: oData.approvername,
                                role: oData.approverrole,
                                status: oData.approveremail ? "Completed" : "Pending"
                            };
                        });

                        if (aApproverList.length === 0) {
                            aApproverList.push(
                                {
                                    approver: "Approver 1",
                                    role: "First Approver",
                                    status: "Completed"
                                },
                                {
                                    approver: "Approver 2",
                                    role: "Final Approver",
                                    status: "Pending"
                                }
                            );
                        }

                        oViewModel.setProperty("/approverList", aApproverList);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch approver list: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/approverList", [
                            {
                                approver: "Approver 1",
                                role: "First Approver",
                                status: "Completed"
                            },
                            {
                                approver: "Approver 2",
                                role: "Final Approver",
                                status: "Pending"
                            }
                        ]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadApproverList: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/approverList", [
                        {
                            approver: "Approver 1",
                            role: "First Approver",
                            status: "Completed"
                        },
                        {
                            approver: "Approver 2",
                            role: "Final Approver",
                            status: "Pending"
                        }
                    ]);
                    resolve();
                }
            });
        },

        _loadReqSeqTracker: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadReqSeqTracker");
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/reqSeqTracker", [
                            {
                                sequence: "1",
                                action: "Created",
                                date: "2025-02-01T10:00:00Z",
                                user: "User1"
                            },
                            {
                                sequence: "2",
                                action: "Submitted",
                                date: "2025-02-02T10:00:00Z",
                                user: "User1"
                            }
                        ]);
                        resolve();
                        return;
                    }

                    const aFilters = [new Filter("reqseqTracker/requestNo", FilterOperator.EQ, sRequestNo)];
                    const oBinding = oODataModel.bindList("/ReqSeqTracker", undefined, undefined, aFilters, {
                        $top: 100,
                        $skip: 0
                    });

                    oBinding.requestContexts(0, 100).then(function (aContexts) {
                        const oViewModel = this.getView().getModel("viewModel");
                        const aReqSeqTracker = aContexts.map(oContext => {
                            const oData = oContext.getObject();
                            return {
                                sequence: oData.ReqTracker.toString(),
                                action: "Sequence " + oData.LastSeq,
                                date: new Date().toISOString(),
                                user: "User" + oData.LastSeq
                            };
                        });

                        if (aReqSeqTracker.length === 0) {
                            aReqSeqTracker.push(
                                {
                                    sequence: "1",
                                    action: "Created",
                                    date: "2025-02-01T10:00:00Z",
                                    user: "User1"
                                },
                                {
                                    sequence: "2",
                                    action: "Submitted",
                                    date: "2025-02-02T10:00:00Z",
                                    user: "User1"
                                }
                            );
                        }

                        oViewModel.setProperty("/reqSeqTracker", aReqSeqTracker);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch request sequence tracker: " + oError.message);
                        const oViewModel = this.getView().getModel("viewModel");
                        oViewModel.setProperty("/reqSeqTracker", [
                            {
                                sequence: "1",
                                action: "Created",
                                date: "2025-02-01T10:00:00Z",
                                user: "User1"
                            },
                            {
                                sequence: "2",
                                action: "Submitted",
                                date: "2025-02-02T10:00:00Z",
                                user: "User1"
                            }
                        ]);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadReqSeqTracker: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/reqSeqTracker", [
                        {
                            sequence: "1",
                            action: "Created",
                            date: "2025-02-01T10:00:00Z",
                            user: "User1"
                        },
                        {
                            sequence: "2",
                            action: "Submitted",
                            date: "2025-02-02T10:00:00Z",
                            user: "User1"
                        }
                    ]);
                    resolve();
                }
            });
        },

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/isLoading", true);

            // Load request details first
            this._loadRequestDetails(sRequestNo).then(() => {
                // Load all related data in parallel
                return Promise.all([
                    this._loadMaterialPriceLot(sRequestNo),
                    this._loadTimeline(sRequestNo),
                    this._loadApproverLog(sRequestNo),
                    this._loadApproverList(sRequestNo),
                    this._loadReqSeqTracker(sRequestNo)
                ]);
            }).then(() => {
                oViewModel.setProperty("/isLoading", false);
            }).catch(oError => {
                Log.error("Failed to load request details: " + oError.message);
                oViewModel.setProperty("/isLoading", false);
                MessageBox.error("Failed to load request details. Please try again later.");
                this.onNavBack();
            });
        },

        _loadRequestDetails: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    const oViewModel = this.getView().getModel("viewModel");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _loadRequestDetails");
                        const oRequest = {
                            requestNo: sRequestNo,
                            createdBy: "Buyer1",
                            createdOn: "Feb 02, 2025",
                            status: "Pending Request",
                            remarks: "Awaiting approval",
                            PendingWith: "Manager1",
                            RequestAging: "10 Days",
                            dcnrFrom: 10,
                            dcnrTo: 20,
                            attachments: [],
                            referenceNo: "REF001",
                            division: "DIV1",
                            salesGroup: "SG1",
                            standardReason: "REASON1",
                            creatorComment: "Initial request"
                        };
                        const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                        oViewModel.setProperty("/request", oRequest);
                        oViewModel.setProperty("/editable", bEditable);
                        this._updateMicroProcessFlow(oRequest.status);
                        resolve();
                        return;
                    }

                    const oBinding = oODataModel.bindContext(`/Requests(${sRequestNo})`);

                    oBinding.requestObject().then(function (oData) {
                        const oRequest = {
                            requestNo: oData.requestNo,
                            createdBy: oData.createdBy || "Unknown",
                            createdOn: oData.createdOn || new Date().toISOString(),
                            status: oData.status,
                            remarks: oData.remarks,
                            PendingWith: oData.PendingWith,
                            RequestAging: oData.RequestAging,
                            dcnrFrom: oData.dcnrFrom,
                            dcnrTo: oData.dcnrTo,
                            attachments: oData.attachments || [],
                            referenceNo: oData.referenceNo || "REF001",
                            division: oData.division || "DIV1",
                            salesGroup: oData.salesGroup || "SG1",
                            standardReason: oData.standardReason || "REASON1",
                            creatorComment: oData.creatorComment || "Initial request"
                        };

                        const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                        oViewModel.setProperty("/request", oRequest);
                        oViewModel.setProperty("/editable", bEditable);
                        this._updateMicroProcessFlow(oRequest.status);
                        resolve();
                    }.bind(this)).catch(function (oError) {
                        Log.error("Failed to fetch request details: " + oError.message);
                        const oRequest = {
                            requestNo: sRequestNo,
                            createdBy: "Buyer1",
                            createdOn: "Feb 02, 2025",
                            status: "Pending Request",
                            remarks: "Awaiting approval",
                            PendingWith: "Manager1",
                            RequestAging: "10 Days",
                            dcnrFrom: 10,
                            dcnrTo: 20,
                            attachments: [],
                            referenceNo: "REF001",
                            division: "DIV1",
                            salesGroup: "SG1",
                            standardReason: "REASON1",
                            creatorComment: "Initial request"
                        };
                        const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                        oViewModel.setProperty("/request", oRequest);
                        oViewModel.setProperty("/editable", bEditable);
                        this._updateMicroProcessFlow(oRequest.status);
                        resolve();
                    }.bind(this));
                } catch (oError) {
                    Log.error("Error in _loadRequestDetails: " + oError.message);
                    const oViewModel = this.getView().getModel("viewModel");
                    const oRequest = {
                        requestNo: sRequestNo,
                        createdBy: "Buyer1",
                        createdOn: "Feb 02, 2025",
                        status: "Pending Request",
                        remarks: "Awaiting approval",
                        PendingWith: "Manager1",
                        RequestAging: "10 Days",
                        dcnrFrom: 10,
                        dcnrTo: 20,
                        attachments: [],
                        referenceNo: "REF001",
                        division: "DIV1",
                        salesGroup: "SG1",
                        standardReason: "REASON1",
                        creatorComment: "Initial request"
                    };
                    const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                    oViewModel.setProperty("/request", oRequest);
                    oViewModel.setProperty("/editable", bEditable);
                    this._updateMicroProcessFlow(oRequest.status);
                    resolve();
                }
            });
        },

        _updateMicroProcessFlow: function (sStatus) {
            const oViewModel = this.getView().getModel("viewModel");
            let aMicroProcessItems = oViewModel.getProperty("/microProcessItems") || [];

            if (aMicroProcessItems.length === 0) {
                aMicroProcessItems = [
                    { state: "None", tooltip: "Step 1: My Draft Request" },
                    { state: "None", tooltip: "Step 2: Send Back Request" },
                    { state: "None", tooltip: "Step 3: Rejected Request" },
                    { state: "None", tooltip: "Step 4: In Progress Request" },
                    { state: "None", tooltip: "Step 5: All Request" }
                ];
            }

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

            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
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
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            if (!oRequest.referenceNo || !oRequest.division) {
                MessageBox.error("Please fill all mandatory fields: Reference No and Division.");
                return;
            }

            this._saveRequest(oRequest).then(() => {
                MessageToast.show("Request saved successfully");
            }).catch(oError => {
                MessageBox.error("Error saving request: " + oError.message);
            });
        },

        _saveRequest: function (oRequest) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _saveRequest");
                        resolve();
                        return;
                    }

                    const oBinding = oODataModel.bindContext(`/Requests(${oRequest.requestNo})`);
                    oBinding.setProperty("dcnrFrom", oRequest.dcnrFrom);
                    oBinding.setProperty("dcnrTo", oRequest.dcnrTo);
                    oBinding.setProperty("remarks", oRequest.remarks);
                    oBinding.setProperty("referenceNo", oRequest.referenceNo);
                    oBinding.setProperty("division", oRequest.division);
                    oBinding.setProperty("salesGroup", oRequest.salesGroup);
                    oBinding.setProperty("standardReason", oRequest.standardReason);
                    oBinding.setProperty("creatorComment", oRequest.creatorComment);

                    oODataModel.submitBatch("updateGroup").then(() => {
                        resolve();
                    }).catch(oError => {
                        Log.error("OData save request failed: " + oError.message);
                        reject(oError);
                    });
                } catch (oError) {
                    Log.error("Error in _saveRequest: " + oError.message);
                    reject(oError);
                }
            });
        },

        onSendBackRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            this._updateRequestStatus(oRequest.requestNo, "Send Back", "Sent back for revision").then(() => {
                MessageToast.show("Request sent back successfully");
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error sending back request: " + oError.message);
            });
        },

        onRejectRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            this._updateRequestStatus(oRequest.requestNo, "Rejected", "Request rejected").then(() => {
                MessageToast.show("Request rejected successfully");
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error rejecting request: " + oError.message);
            });
        },

        onApproveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            this._updateRequestStatus(oRequest.requestNo, "Approved", "Request approved").then(() => {
                MessageToast.show("Request approved successfully");
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error approving request: " + oError.message);
            });
        },

        _updateRequestStatus: function (sRequestNo, sStatus, sRemarks) {
            return new Promise((resolve, reject) => {
                try {
                    const oODataModel = this.getOwnerComponent().getModel("catalog");
                    if (!oODataModel) {
                        Log.error("OData model 'catalog' not found during _updateRequestStatus");
                        resolve();
                        return;
                    }

                    const oBinding = oODataModel.bindContext(`/Requests(${sRequestNo})`);
                    oBinding.setProperty("status", sStatus);
                    oBinding.setProperty("remarks", sRemarks);
                    oBinding.setProperty("PendingWith", sStatus === "Send Back" ? oBinding.getObject().createdBy : "");

                    oODataModel.submitBatch("updateGroup").then(() => {
                        resolve();
                    }).catch(oError => {
                        Log.error("OData update request status failed: " + oError.message);
                        reject(oError);
                    });
                } catch (oError) {
                    Log.error("Error in _updateRequestStatus: " + oError.message);
                    reject(oError);
                }
            });
        },

        onDownloadFile: function (oEvent) {
            const oItem = oEvent.getSource().getBindingContext("viewModel").getObject();
            if (oItem && oItem.fileName) {
                MessageToast.show("Downloading file: " + oItem.fileName);
            } else {
                MessageBox.error("No file selected for download.");
            }
        },

        onDetailsTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            MessageToast.show(`Selected tab: ${sKey}`);
        },

        onMicroProcessItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const sTooltip = oItem.getTooltip();

            if (!sTooltip) {
                MessageBox.error("No tooltip available for this item.");
                return;
            }

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
                }).catch(oError => {
                    Log.error("Error loading OrderStatusDialog: " + oError.message);
                    MessageBox.error("Error loading dialog");
                });
            } else {
                this._updateOrderStatusDialog(sTooltip);
                this._oOrderStatusDialog.open();
            }
        },

        _updateOrderStatusDialog: function (sTooltip) {
            if (this._oOrderStatusDialog) {
                const oContent = this._oOrderStatusDialog.getContent();
                if (oContent && oContent.length > 0) {
                    const oItems = oContent[0].getItems();
                    if (oItems && oItems.length >= 2) {
                        const oTitle = oItems[0].getItems()[1];
                        const oText = oItems[1];
                        oTitle.setText(sTooltip);
                        oText.setText(`Details for ${sTooltip}`);
                    } else {
                        Log.error("OrderStatusDialog content structure is incorrect.");
                    }
                } else {
                    Log.error("OrderStatusDialog has no content.");
                }
            } else {
                Log.error("OrderStatusDialog is not initialized.");
            }
        },

        onCloseOrderStatus: function () {
            if (this._oOrderStatusDialog) {
                this._oOrderStatusDialog.close();
            } else {
                MessageBox.error("Order Status Dialog not found.");
            }
        }
    });
});


UPDATED CODE 2 

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
    "sap/ui/core/library",
    "sap/base/Log"
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, DateFormat, History, Fragment, UIComponent, coreLibrary, Log) {
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
                approverLog: [],
                approverList: [],
                reqSeqTracker: [],
                newRequest: {
                    type: "",
                    description: "",
                    file: null
                },
                uploadedFiles: [],
                uploadedFilesCount: 0,
                editable: true,
                isLoading: true
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Initialize micro process flow data
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

        _loadMaterialPriceLot: function (sMaterial) {
            return new Promise((resolve, reject) => {
                // Simulate API call to /MaterialPriceLot endpoint
                setTimeout(() => {
                    try {
                        const oViewModel = this.getView().getModel("viewModel");
                        // This would be replaced with actual API call
                        // fetch(`/MaterialPriceLot?material=${sMaterial}`).then(...)
                        const aPriceDetails = [
                            {
                                material: sMaterial || "FC88B7866",
                                priceList: "04",
                                priceListDescription: "Price Lot 04",
                                uom: "EA",
                                indicativeMRP: "41.00",
                                startDate: "13-05-2025",
                                endDate: "24-07-2025",
                                defaultPrice: "X"
                            },
                            // ... (other mock price details from original code)
                        ];
                        oViewModel.setProperty("/priceDetails", aPriceDetails);
                        resolve();
                    } catch (oError) {
                        reject(oError);
                    }
                }, 300);
            });
        },

        _loadApproverLog: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                // Simulate API call to /ApproverLog endpoint
                setTimeout(() => {
                    try {
                        const oViewModel = this.getView().getModel("viewModel");
                        // This would be replaced with actual API call
                        // fetch(`/ApproverLog?requestNo=${sRequestNo}`).then(...)
                        const aApproverLog = [
                            {
                                approver: "Approver 1",
                                action: "Approved",
                                date: "2025-02-01",
                                comments: "Looks good"
                            },
                            {
                                approver: "Approver 2",
                                action: "Reviewed",
                                date: "2025-02-02",
                                comments: "Needs more info"
                            }
                        ];
                        oViewModel.setProperty("/approverLog", aApproverLog);
                        resolve();
                    } catch (oError) {
                        reject(oError);
                    }
                }, 300);
            });
        },

        _loadApproverList: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                // Simulate API call to /ApproverList endpoint
                setTimeout(() => {
                    try {
                        const oViewModel = this.getView().getModel("viewModel");
                        // This would be replaced with actual API call
                        // fetch(`/ApproverList?requestNo=${sRequestNo}`).then(...)
                        const aApproverList = [
                            {
                                approver: "Approver 1",
                                role: "First Approver",
                                status: "Completed"
                            },
                            {
                                approver: "Approver 2",
                                role: "Final Approver",
                                status: "Pending"
                            }
                        ];
                        oViewModel.setProperty("/approverList", aApproverList);
                        resolve();
                    } catch (oError) {
                        reject(oError);
                    }
                }, 300);
            });
        },

        _loadReqSeqTracker: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                // Simulate API call to /ReqSeqTracker endpoint
                setTimeout(() => {
                    try {
                        const oViewModel = this.getView().getModel("viewModel");
                        // This would be replaced with actual API call
                        // fetch(`/ReqSeqTracker?requestNo=${sRequestNo}`).then(...)
                        const aReqSeqTracker = [
                            {
                                sequence: "1",
                                action: "Created",
                                date: "2025-02-01",
                                user: "User1"
                            },
                            {
                                sequence: "2",
                                action: "Submitted",
                                date: "2025-02-02",
                                user: "User1"
                            }
                        ];
                        oViewModel.setProperty("/reqSeqTracker", aReqSeqTracker);
                        resolve();
                    } catch (oError) {
                        reject(oError);
                    }
                }, 300);
            });
        },

        _onRouteMatched: function (oEvent) {
            const sRequestNo = oEvent.getParameter("arguments").requestNo;
            const oComponentModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel("viewModel");

            if (!oComponentModel) {
                MessageToast.show("Component model not found");
                this.onNavBack();
                return;
            }

            oViewModel.setProperty("/isLoading", true);

            // Load all related data in parallel
            Promise.all([
                this._loadRequestDetails(sRequestNo),
                this._loadMaterialPriceLot(),
                this._loadApproverLog(sRequestNo),
                this._loadApproverList(sRequestNo),
                this._loadReqSeqTracker(sRequestNo)
            ]).then(() => {
                oViewModel.setProperty("/isLoading", false);
            }).catch(oError => {
                Log.error("Failed to load request details: " + oError.message);
                oViewModel.setProperty("/isLoading", false);
                MessageBox.error("Failed to load request details. Please try again later.");
                this.onNavBack();
            });
        },

        _loadRequestDetails: function (sRequestNo) {
            return new Promise((resolve, reject) => {
                const oComponentModel = this.getOwnerComponent().getModel();
                const aRequests = oComponentModel.getProperty("/requests") || [];
                const oRequest = aRequests.find(req => req.requestNo === sRequestNo);

                if (oRequest) {
                    const oViewModel = this.getView().getModel("viewModel");
                    
                    // Set editable based on status
                    const bEditable = oRequest.status === "Draft" || oRequest.status === "Send Back";
                    
                    oViewModel.setProperty("/request", { ...oRequest });
                    oViewModel.setProperty("/editable", bEditable);
                    
                    // Update micro process flow based on request status
                    this._updateMicroProcessFlow(oRequest.status);
                    
                    resolve();
                } else {
                    reject(new Error(`Request ${sRequestNo} not found`));
                }
            });
        },

        _updateMicroProcessFlow: function (sStatus) {
            const oViewModel = this.getView().getModel("viewModel");
            let aMicroProcessItems = oViewModel.getProperty("/microProcessItems") || [];

            // Initialize micro process items if empty
            if (aMicroProcessItems.length === 0) {
                aMicroProcessItems = [
                    {
                        state: "None",
                        text: "①",
                        tooltip: "Step 1: Request Created"
                    },
                    {
                        state: "None",
                        text: "②",
                        tooltip: "Step 2: First Approval"
                    },
                    {
                        state: "None",
                        text: "③",
                        tooltip: "Step 3: Final Approval"
                    }
                ];
            }

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

            oViewModel.setProperty("/microProcessItems", aMicroProcessItems);
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
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            // Validate mandatory fields
            if (!oRequest.referenceNo || !oRequest.division) {
                MessageBox.error("Please fill all mandatory fields: Reference No and Division.");
                return;
            }

            // Simulate API call to save request
            this._saveRequest(oRequest).then(() => {
                MessageToast.show("Request saved successfully");
            }).catch(oError => {
                MessageBox.error("Error saving request: " + oError.message);
            });
        },

        _saveRequest: function (oRequest) {
            return new Promise((resolve, reject) => {
                try {
                    const oComponentModel = this.getOwnerComponent().getModel();
                    const aRequests = oComponentModel.getProperty("/requests") || [];
                    const iIndex = aRequests.findIndex(req => req.requestNo === oRequest.requestNo);

                    if (iIndex >= 0) {
                        aRequests[iIndex] = { ...aRequests[iIndex], ...oRequest };
                        oComponentModel.setProperty("/requests", aRequests);
                        resolve();
                    } else {
                        reject(new Error("Request not found"));
                    }
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        onSendBackRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            // Simulate API call to send back request
            this._updateRequestStatus(oRequest.requestNo, "Send Back", "Sent back for revision").then(() => {
                MessageToast.show("Request sent back successfully");
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error sending back request: " + oError.message);
            });
        },

        onRejectRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            // Simulate API call to reject request
            this._updateRequestStatus(oRequest.requestNo, "Rejected", "Request rejected").then(() => {
                MessageToast.show("Request rejected successfully");
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error rejecting request: " + oError.message);
            });
        },

        onApproveRequest: function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oRequest = oViewModel.getProperty("/request");

            // Simulate API call to approve request
            this._updateRequestStatus(oRequest.requestNo, "Approved", "Request approved").then(() => {
                MessageToast.show("Request approved successfully");
                this.onNavBack();
            }).catch(oError => {
                MessageBox.error("Error approving request: " + oError.message);
            });
        },

        _updateRequestStatus: function (sRequestNo, sStatus, sRemarks) {
            return new Promise((resolve, reject) => {
                try {
                    const oComponentModel = this.getOwnerComponent().getModel();
                    const aRequests = oComponentModel.getProperty("/requests") || [];
                    const iIndex = aRequests.findIndex(req => req.requestNo === sRequestNo);

                    if (iIndex >= 0) {
                        aRequests[iIndex] = {
                            ...aRequests[iIndex],
                            status: sStatus,
                            remarks: sRemarks,
                            pendingWith: sStatus === "Send Back" ? aRequests[iIndex].createdBy : ""
                        };
                        oComponentModel.setProperty("/requests", aRequests);
                        resolve();
                    } else {
                        reject(new Error("Request not found"));
                    }
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        onDownloadFile: function (oEvent) {
            const oItem = oEvent.getSource().getBindingContext("viewModel").getObject();
            MessageToast.show("Downloading file: " + oItem.fileName);
        },

        onDetailsTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
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

            // Initialize micro process flow data
            const oComponentModel = this.getOwnerComponent().getModel();
            if (!oComponentModel) {
                MessageToast.show("Component model not initialized");
                return;
            }

            const oComponentData = {
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
            oComponentModel.setData({ ...oComponentModel.getData(), ...oComponentData });

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
            MessageToast.show(`The file type *.${oEvent.getParameter(" utrType")} is not supported. Choose one of the following types: ${aFileTypes.join(", ")}`);
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

OLD CODE


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
