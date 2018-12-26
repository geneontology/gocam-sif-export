BiMap = require('bidirectional-map');

let causal = new BiMap();
let context = new BiMap();
let rdfs = new BiMap();
let owl = new BiMap();
let dc = new BiMap();
let pav = new BiMap();

rdfs.set("rdfs_label", "http://www.w3.org/2000/01/rdf-schema#");
rdfs.set("rdfs_type", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

owl.set("owl_individual", "http://www.w3.org/2002/07/owl#NamedIndividual");
dc.set("contributor", "http://purl.org/dc/elements/1.1/contributor");
dc.set("date", "http://purl.org/dc/elements/1.1/date");

pav.set("providedBy", "http://purl.org/pav/providedBy");

causal.set("enabled_by", "http://purl.obolibrary.org/obo/RO_0002333");
causal.set("occurs_in", "http://purl.obolibrary.org/obo/BFO_0000066");

causal.set("has_input", "http://purl.obolibrary.org/obo/RO_0002233");
causal.set("has_output", "http://purl.obolibrary.org/obo/RO_0002234");

causal.set("part_of", "http://purl.obolibrary.org/obo/BFO_0000050");
causal.set("has_part", "http://purl.obolibrary.org/obo/BFO_0000051");

causal.set("directly_activates", "http://purl.obolibrary.org/obo/RO_0002406");
causal.set("directly_inhibits", "http://purl.obolibrary.org/obo/RO_0002408");

causal.set("directly_provides_input_for", "http://purl.obolibrary.org/obo/RO_0002413");
causal.set("directly_positively_regulates", "http://purl.obolibrary.org/obo/RO_0002629");
causal.set("directly_negatively_regulates", "http://purl.obolibrary.org/obo/RO_0002630");

causal.set("causally_upstream_of", "http://purl.obolibrary.org/obo/RO_0002411");
causal.set("causally_upstream_of_positive_effect", "http://purl.obolibrary.org/obo/RO_0002304");
causal.set("causally_upstream_of_negative_effect", "http://purl.obolibrary.org/obo/RO_0002305");

causal.set("causally_upstream_of_or_within", "http://purl.obolibrary.org/obo/RO_0002418");
causal.set("causally_upstream_of_or_within_positive_effect", "http://purl.obolibrary.org/obo/RO_0004047");
causal.set("causally_upstream_of_or_within_negative_effect", "http://purl.obolibrary.org/obo/RO_0004046");

causal.set("positively_regulates", "http://purl.obolibrary.org/obo/RO_0002213");
causal.set("negatively_regulates", "http://purl.obolibrary.org/obo/RO_0002212");

causal.set("results_in_acquisition_of_features_of", "http://purl.obolibrary.org/obo/RO_0002315");
causal.set("transports_or_maintains_localization_of", "http://purl.obolibrary.org/obo/RO_0002313");
causal.set("results_in_movement_of", "http://purl.obolibrary.org/obo/RO_0002565");


exports.causal = causal;
exports.rdfs = rdfs;
exports.owl = owl;
exports.dc = dc;
exports.pav = pav;

