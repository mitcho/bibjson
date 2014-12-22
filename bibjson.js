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

var authorUrls = {
	'van Urk, Coppe': 'http://web.mit.edu/cvanurk/www/',
	'Levin, Theodore': 'https://sites.google.com/site/tfranklevin/',
	'Kotek, Hadas': 'http://hkotek.com'
};

function cleanup(text) {
	// todo: it would be great if this could be automated somehow:
 	text = text.replace('{\\v \\i}','ǐ'); // for bǐ
 	text = text.replace('{\\u \\a}','ă');
 	text = text.replace('{\\c \\s}','ş');

 	text = text.replace('\\&','&amp;');
 	
	text = text.replace('\\VAN{Urk}', 'van Urk'); // for Coppe
	text = text.replace(/{\\em ([^}]*)}/g,'<em>$1</em>');
	text = text.replace(/{(.+?)}/g,'$1');
	
	return text;
}

function parseAuthors(text) {
	var rawAuthors = text.split(' and ');
	var authors = [];
	for ( i in rawAuthors ) {
		var author = rawAuthors[i];
		var authorParts = author.split(', ');
		var item = {
			'name': author,
			'lastName': authorParts[0],
			'displayName': authorParts[1] + ' ' + authorParts[0]
		};
		if ( author in authorUrls ) {
			item.url = authorUrls[author];
		}
		authors.push(item);
	}
	return authors;
}

function convertItem(item) {
	var newItem = {
		citationKey: item.citationKey.toLowerCase(),
		entryType: item.entryType.toLowerCase(),
		keywords: [],
		authors: []
	};
	var keys = ['AUTHOR', 'EDITOR', 'TITLE', 'URL', 'NOTE', 'YEAR', 'ABSTRACT', 'BOOKTITLE', 'JOURNAL', 'PAGES', 'SCHOOL'];
	for (i in keys) {
		if (keys[i] in item.entryTags)
			newItem[keys[i].toLowerCase()] = cleanup(item.entryTags[keys[i]], keys[i]);
	}
	
	if ('AUTHOR' in item.entryTags) {
		newItem['authors'] = parseAuthors(cleanup(item.entryTags['AUTHOR']));
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
