// Michael Yoshitaka Erlewine <mitcho@mitcho.com>
// Dedicated to the public domain, 2014

var parser = require('bibtex-parser-js'),
	format = require('jsonf'),
	fs = require('fs'),
	util = require('util');

var path = '/Users/mitcho/Dropbox/academic/paperarchive/paperarchive.bib';
var paperarchive = fs.readFileSync(path).toString();

paperarchive = paperarchive.replace(/@comment{BibDesk Static Groups{(.|\n)*}}/m, '');

var bib = parser.toJSON(paperarchive);

function cleanup(text) {
	// todo: it would be great if this could be automated somehow:
 	text = text.replace('{\\v \\i}','ǐ'); // for bǐ
 	text = text.replace('{\\u \\a}','ă');
 	text = text.replace('{\\c \\s}','ş');
 	
	text = text.replace('\\VAN{Urk}', 'van Urk'); // for Coppe
	text = text.replace(/{(\w)}/g,'$1');
	text = text.replace(/{\\em ([^}]*)}/g,'<em>$1</em>');
	return text;
}

function convertItem(item) {
	var newItem = {
		citationKey: item.citationKey.toLowerCase(),
		entryType: item.entryType.toLowerCase(),
		keywords: []
	};
	var keys = ['AUTHOR','EDITOR','TITLE','URL','NOTE','YEAR'];
	for (i in keys) {
		if (keys[i] in item.entryTags)
			newItem[keys[i].toLowerCase()] = cleanup(item.entryTags[keys[i]]);
	}
	if ('KEYWORDS' in item.entryTags)
		newItem.keywords = item.entryTags.KEYWORDS.split(/, */);
	return newItem;
}

// now filter for my stuff
var mybib = [];
for (i in bib) {
	var item = bib[i];
// 	console.log(item);
	if (!('entryTags' in item))
		continue;
	
	if (!('AUTHOR' in item.entryTags && item.entryTags.AUTHOR.search('Erlewine') > -1) &&
		!('EDITOR' in item.entryTags && item.entryTags.EDITOR.search('Erlewine') > -1))
		continue;
	
	mybib.push(convertItem(item));
}

util.print(format(JSON.stringify(mybib)));
