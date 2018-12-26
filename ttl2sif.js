const fs = require('fs');
const rdf = require('rdf');
const graphlib = require('graphlib');
const archiver = require('archiver');

// BiMap of URI <-> Label
const relations = require('./relations');
const causal = relations.causal;
const rdfs = relations.rdfs;
const owl = relations.owl;
const dc = relations.dc;
const pav = relations.pav;


if (process.argv.length <= 4) {
    console.log("Usage: " + __filename + " <input:ttl:folder> <output:sif:folder> <output:sif:archive>\n");
    process.exit(-1);
}

const args = process.argv.slice(2)

var output_archive = args[2];
if(!output_archive.endsWith(".zip"))
    output_archive += ".zip";

var output = fs.createWriteStream(output_archive);
var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('warning', function (err) {
    console.error.log(err);
});

archive.on('error', function (err) {
    console.log(err);
});

// pipe archive data to the file
archive.pipe(output);


var input_dir = args[0];
if (!input_dir.endsWith("/"))
    input_dir += "/";

var output_dir = args[1];
if (!output_dir.endsWith("/"))
    output_dir += "/";


if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir);
}


// URL to json file for IRI <-> CURIE
var url = "https://raw.githubusercontent.com/prefixcommons/biocontext/master/registry/go_context.jsonld";
const request = require('request');
const cutil = require('@geneontology/curie-util-es5');

request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var js = JSON.parse(body);
        var tempMap = cutil.parseContext(js);
        var curie = new cutil.CurieUtil(tempMap);

        startProcess(curie);
    } else {
        console.log(error);
        process.exit(-1);
    }
});


var parse;
startProcess = function (curie) {
    fs.readdir(input_dir, (err, files) => {
        files.forEach(file => {

            var rdfData = fs.readFileSync(input_dir + file).toString();
            parse = rdf.TurtleParser.parse(rdfData);

            let entries = causal.entries();
            let entry = entries.next();

            let entityMap = new Map();
            let typeCount = new Map();
            let counts;

            let iterationSymbol = "^"
            let sif_content = "";
            // multigraph to true as we could have several edges between the same pair of nodes
            var camgraph = new graphlib.Graph({ multigraph: true });

            while (!entry.done) {
                parse.graph.match(null, entry.value[1], null)
                    .forEach(triple => {

                        let subTypes = types(triple.subject);

                        let objTypes = types(triple.object);

                        if (!objTypes)
                            objTypes = [triple.object.toString()];

                        let subName = "N/A";
                        if (entityMap.has(triple.subject.toString())) {
                            subName = entityMap.get(triple.subject.toString());
                        } else {
                            if (!typeCount.has(subTypes[0])) {
                                typeCount.set(subTypes[0], 0);
                                subName = subTypes[0] + iterationSymbol + "0";
                            } else {
                                let newid = typeCount.get(subTypes[0]) + 1;
                                typeCount.set(subTypes[0], newid);
                                subName = subTypes[0] + iterationSymbol + newid + "";
                            }
                            entityMap.set(triple.subject.toString(), subName);
                            camgraph.setNode(curie.getCurie(subName), curie.getCurie(subName));
                            //                            console.log(triple.subject.toString());
                        }

                        let objName = "N/A";
                        if (entityMap.has(triple.object.toString())) {
                            objName = entityMap.get(triple.object.toString());
                        } else {
                            if (!typeCount.has(objTypes[0])) {
                                typeCount.set(objTypes[0], 0);
                                objName = objTypes[0] + iterationSymbol + "0";
                            } else {
                                let newid = typeCount.get(objTypes[0]) + 1;
                                typeCount.set(objTypes[0], newid);
                                objName = objTypes[0] + iterationSymbol + newid + "";
                            }
                            entityMap.set(triple.object.toString(), objName);
                            camgraph.setNode(curie.getCurie(objName), curie.getCurie(objName));
                        }
                        // if(!isGO(objName)) {
                        //     console.log("\n**** " , triple.object);
                        //     parse.graph.match(triple.object, null, null).forEach(secTriple => {
                        //         console.log("\t" , secTriple);
                        //     });
                        // }

                        sif_content += curie.getCurie(subName) + "\t" + entry.value[0] + "\t" + curie.getCurie(objName) + "\n";
                        // console.log(curie.getCurie(subName), entry.value[0], curie.getCurie(objName));
                        camgraph.setEdge(curie.getCurie(subName), curie.getCurie(objName), entry.value[0]);
                    });

                entry = entries.next();
            }
            fs.writeFileSync(output_dir + file.substring(0, file.lastIndexOf(".")) + ".sif", sif_content);
            archive.append(sif_content, { name:  file.substring(0, file.lastIndexOf(".")) + ".sif" });

            //             let gps = new Set();
            //             for(let node of camgraph.nodes()) {
            //                 if(isGP(node)) {
            // //                    gps.add(node.substring(0, node.indexOf(iterationSymbol)));
            //                     gps.add(node);
            //                 }
            //             }
            //             console.log(gps);

            //             let components = graphlib.alg.components(camgraph);
            //             console.log(components);

            // for the simple GP-GP graph, we just look for each pair (GP1, GP2) wether there is a path or not
            // for(var edge of camgraph.edges()) {
            //     let type = camgraph.edge({v: edge.v, w: edge.w});
            //     // console.log("** " , edge, type, isGO(edge.v), isGO(edge.w));
            //     // if(isGO(edge.v)) {
            //     //     console.log(camgraph.successors(edge.v));
            //     // }
            // }

        });
        archive.finalize();
    })

}


isGO = function (label) {
    return label.indexOf("GO:") != -1;
}

isGP = function (label) {
    return !isGO(label);
}



types = function (id, includeIndividual = false) {
    if (isBlankNode(id)) return null;
    let results = [];
    parse.graph.match(id.toString(), rdfs.get("rdfs_type"), null).forEach(triple => {
        if (includeIndividual || (!includeIndividual && triple.object.toString() != owl.get("owl_individual")))
            results.push(triple.object.toString());
    })
    return results.length > 0 ? results : null;
}

labels = function (id) {
    if (isBlankNode(id)) return null;
    let results = [];
    parse.graph.match(id.toString(), rdfs.get("rdfs_label"), null).forEach(triple => {
        results.push(triple.object.toString());
    })
    return results.length > 0 ? results : null;
}

isLiteral = function (id) {
    return id.nodeType() == "PlainLiteral";
}

isBlankNode = function (id) {
    return id.nodeType() == "BlankNode";
}

simplify = function (label) {
    if (label.indexOf("/") == -1)
        return label.trim();
    return label.substring(label.lastIndexOf("/") + 1).trim();
}


