PoolPartyPage.prototype.Corpus.CandidateConcepts = (function () {

    var displayOverview = function () {
        ajax.get("!/candidate/view/list", function (resp) {
            dom.get("centertablecontent").innerHTML = resp.responseText;
            setupTable();
        });
    };

    var setupTable = function () {
        var dataSource = new YAHOO.util.DataSource("!/candidate/concept");
        dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
        dataSource.responseSchema = {
            resultsList: "data",
            fields: [
                {key: "uri.uri"},
                {key: "created"},
                {key: "label"},
                {key: "lang"},
                {key: "broader"},
                {key: "narrower"},
                {key: "corpusUris"}
            ],
            metaFields: {
                totalRecords: "totalRecords",
                startIndex: "startIndex",
                pageSize: "pageSize",
                params: "params"
            }
        };

        var dateFormatter = function (elLiner, oRecord, oColumn, oData) {
            elLiner.innerHTML = Locale.getDateString(oData);
        };

        var columnDefs = [
            {key: "created", label: "Created", sortable: false, formatter: dateFormatter},
            {key: "label", label: "Label", sortable: false},
            {key: "action", label: "Action", sortable: false}
        ];

        var config = {
            initialRequest: "",
            generateRequest: PPP.CustomRdf._generateRequest,
            dynamicData: true,
            paginator: new YAHOO.widget.Paginator({
                rowsPerPage: 20,
                alwaysVisible: false
            }),
            MSG_EMPTY: Locale.getString("corpus.candidate.no.results")
        };

        var dataTable = new YAHOO.widget.DataTable("candidateConceptsTable", columnDefs, dataSource, config);
        dataTable.doBeforeLoadData = function (oRequest, oResponse, oPayload) {
            oPayload.totalRecords = oResponse.meta.totalRecords;
            oPayload.pagination.recordOffset = oResponse.meta.startIndex;
            return oPayload;
        };

        // hover + select
        //
        dataTable.subscribe("rowMouseoverEvent", dataTable.onEventHighlightRow);
        dataTable.subscribe("rowMouseoutEvent", dataTable.onEventUnhighlightRow);
        dataTable.subscribe("rowClickEvent", dataTable.onEventSelectRow);


        // select all / none
        //
        YAHOO.util.Event.addListener("corpus-candidate-select-all", "click", function () {
            for (var i = 0; i < dataTable.getRecordSet().getLength(); i++) {
                dataTable.selectRow(i);
            }
        });
        YAHOO.util.Event.addListener("corpus-candidate-select-none", "click", function () {
            for (var i = 0; i < dataTable.getRecordSet().getLength(); i++) {
                dataTable.unselectRow(i);
            }
        });
        YAHOO.util.Event.addListener("corpus-candidate-delete", "click", function () {
            var rowIds = dataTable.getSelectedRows();

            var uris = [];

            if (rowIds.length == 0) {
                return;
            }

            for (var i = 0; i < rowIds.length; i++) {
                var rowId = rowIds[i];
                if (rowId != undefined && rowId != null) {
                    var record = dataTable.getRecord(rowId);
                    if (record != null) {
                        uris.push(new URI(record.getData("uri.uri")));
                    }
                }
            }
            ajax.postJson("!/candidate/concept/delete/", uris, function (resp) {
                for (i = 0; i < rowIds.length; i++) {
                    dataTable.deleteRow(dataTable.getRecord(rowIds[i]));
                }
            });
        });

        new PPP.ThesaurusIntegration(dataTable)
            .setSelectTermFormatter(function (record) {
                return "<div class='term'>" + record.getData("label") + "</div>"
            })
            .postPath("!/candidate/bind")
            .postHandler(function (_) {
                displayOverview();
            })
            .build();

    };

    var showDetails = function (candidateUri) {
        ajax.get("!/candidate/view/" + encodeURIComponent(candidateUri), function (resp) {
            dom.get("centertablecontent").innerHTML = resp.responseText;
        });
    };

    return {
        displayOverview: displayOverview,
        showDetails: showDetails,
        setupTable: setupTable
    };
})();

PoolPartyPage.prototype.Corpus.ThesaurusTree = (function(){
    'use strict';

    var loadChildren = function(targetNode){

    };

    var init = function(){
        var tree = new YAHOO.widget.TreeView("thesaurus-nav");
        var root = tree.getRoot();

        tree.subscribe("clickEvent", function(oArgs){
            var node = oArgs.node;
            var uri = node.data.uri;
            console.dir("todo show details for " + uri);

            return false;   //disable collapse on click
        });

        tree.setDynamicLoad(function (targetNode, finished) {
            var params = "";

            if('uri' in targetNode.data){
                params = "parentUri=" + targetNode.data.uri;
            }


            ajax.post("!/tree", params, function (resp) {
                var nodes = JSON.parse(resp.responseText);

                nodes.forEach(function (node) {
                    var count = " (" + node.nodeChildren + ")";
                    var className = "conceptScheme";

                    if(targetNode.data.nodeType === "http://www.w3.org/2004/02/skos/core#ConceptScheme")
                        className = "topConcept";
                    else if(targetNode.data.nodeType === "http://www.w3.org/2004/02/skos/core#Concept")
                        className = "subConcept";

                    var htmlMarkup = "<div class='" + className + "'>" + node.nodeLabel + count + "</div>";
                    var tempNode = new YAHOO.widget.HTMLNode(htmlMarkup, targetNode, false);
                    tempNode.data.uri = node.nodeURI;
                    tempNode.data.nodeType = node.nodeType;

                    if(node.nodeChildren === 0)
                        tempNode.isLeaf = true;
                });

                finished();
            });
        }, 1);

        var htmlMarkup = "<div class='context'>Thesaurus</div>";
        var thesaurusNode = new YAHOO.widget.HTMLNode(htmlMarkup, root, false);

        tree.draw();

    };

    return {
        init: init,
        loadChildren: loadChildren
    }
})();

PoolPartyPage.prototype.Corpus.CandidateConcepts.Tree = (function () {
    var _tree = null;

    var init = function () {
        var candidateNode = PPP.CorpusTree.getNodeByProperty("nodeType", "candidateroot");
        PPP.Corpus.CandidateConcepts.Tree.root = _tree = candidateNode;

        if (candidateNode !== null) {
            candidateNode.setDynamicLoad(function (targetNode, finished) {
                ajax.get("!/candidate/tree", function (resp) {
                    var nodes = JSON.parse(resp.responseText);

                    nodes.forEach(function (node) {
                        var htmlMarkup = "<div class='candidateconcept'>" + node.label + "</div>";
                        var tempNode = new YAHOO.widget.HTMLNode(htmlMarkup, targetNode, false);
                        tempNode.data.uri = node.uri.uri;
                        tempNode.data.nodeType = "candidateconcept";

                        tempNode.isLeaf = false;
                    });

                    finished();
                });
            });
        }
    };

    var refresh = function () {
        if (_tree.expanded === false)
            return;

        PPP.Corpus.CandidateConcepts.Tree.root.tree.removeChildren(_tree);
        PPP.Corpus.CandidateConcepts.Tree.root.expand();
    };

    var isExpanded = function () {
        return _tree.expanded;
    };

    /**
     *
     * @param params
     * label
     * lang
     */
    var addConcept = function (params) {

        //test
        if (typeof params === "undefined") {
            params = {
                label: "foo",
                lang: "en"
            };
        }

        ajax.postJson("!/candidate/concept", params, function (resp) {
            PPP.Corpus.CandidateConcepts.Tree.refresh();
        });
    };

    var deleteConcept = function (uri) {
        var params = [new URI(uri)];

        ajax.postJson("!/candidate/concept/delete", params, function (resp) {
            var status = JSON.parse(resp.responseText);

            if (status.success) {
                PPP.Corpus.CandidateConcepts.Tree.refresh();
                document.getElementsByClassName("candidateroot")[0].click();
            }
        });
    };

    var show = function() {
        alert("not yet implemetned");
        // todo:
        // - simulate click in tree,
        // - highlight node
        // - display candy overview in details view
    };

    return {
        init: init,
        show: show,
        refresh: refresh,
        isExpanded: isExpanded,
        addConcept: addConcept,
        deleteConcept: deleteConcept
    }
})();
