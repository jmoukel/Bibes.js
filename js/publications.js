
(function (exports)
{
	"use strict";

	/// CONSTANTS
	var BIBTEXT_FILE_URL 	 		 = "data/ivPCL.bib";
	var PUBLICATIONS_DIV_CLASS_NAME  = "publicationsDiv";

	/// GLOBAL VARIABLES
	//
	/// Content of the bibtex file but in JSON format.
	var bibTextJSON;
	var publicationsArray;

	/**************************
	 *						  *
	 *	       OBJECTS        *
	 *					      *
	 **************************/

	 /// Object that will contains the information of one publication.
	 function Publication(issn, author, booktitle, month, pages, realTitle, year, journal, url, volume, number, editor, address, note)
	 {
	 	this.ISSN 		= issn;
	 	this.author 	= author;
	 	this.booktitle  = booktitle;
	 	this.month 		= month;
	 	this.pages 		= pages;
	 	this.realTitle  = realTitle;
	 	this.year 		= year;
	 	this.journal 	= journal;
	 	this.url 		= url;
	 	this.volume 	= volume;	 	
	 	this.number 	= number;
	 	this.editor 	= editor;
	 	this.address 	= address;
	 	this.note 		= note;
	 }

	/**************************
	 *						  *
	 *	  PUBLIC FUNCTIONS    *
	 *					      *
	 **************************/

	/**
	 * Initializes the publications page.
	 *
	 */
	 exports.init = function() 
	 {
	 	// init vars
		bibTextJSON       = "";
		publicationsArray = [];

	 	// Extracting content from Bibtext file.
	 	startReadingBibtexFile(parseBibTexToJSON);
     };

	/**************************
	 *						  *
	 *	  PRIVATE FUNCTIONS   *
	 *					      *
	 **************************/

	/**
	 * It starts reading the content of the bibtex file which path is in constant BIBTEXT_FILE_URL. When complete, it calls the input function "completionFunction" to handle the content read.
	 *
	 * @param completionFunction		Function to be called when the reading complete. This function is supposed to receive a string with the content read from the bibtex file.
	 */
	 function startReadingBibtexFile(completionFunction)
	 {
	 	// Extracting bibtex file content.
	 	$.get(BIBTEXT_FILE_URL, completionFunction);
	 }

	/**
	 * It parses the input "data" and converts it to JSON.
	 *
	 * @param data		String extracted from a BibText file.
	 */
	 function parseBibTexToJSON(data)
	 {
	 	// Converting bibtext content string to JSON.
		bibTextJSON = bibtexParse.toJSON(data);

		// Extracting the info from the JSON object and putting it in the publications array.
		for (var i=0; i<bibTextJSON.length; i++)
	 	{
	 		var issn, author, booktitle, month, pages, realTitle, year, journal, url, volume, number, editor, address, note;
	 		var entryTag = bibTextJSON[i].entryTags;

	 		// Extracting info from entry tag.
	 		issn 	  = (typeof(entryTag.ISSN) 		!== 'undefined') ? entryTag.ISSN       : "";
	 		author 	  = (typeof(entryTag.author)    !== 'undefined') ? entryTag.author     : "";
	 		booktitle = (typeof(entryTag.booktitle) !== 'undefined') ? entryTag.booktitle  : "";
	 		month 	  = (typeof(entryTag.month)     !== 'undefined') ? entryTag.month      : "";
	 		pages 	  = (typeof(entryTag.pages) 	!== 'undefined') ? entryTag.pages      : "";
	 		realTitle = (typeof(entryTag.realTitle) !== 'undefined') ? entryTag.realTitle  : "";
	 		year      = (typeof(entryTag.year) 		!== 'undefined') ? entryTag.year       : "";	 		
	 		journal   = (typeof(entryTag.journal) 	!== 'undefined') ? entryTag.journal    : "";
	 		url 	  = (typeof(entryTag.url)		!== 'undefined') ? entryTag.url  	   : "";
	 		volume    = (typeof(entryTag.volume) 	!== 'undefined') ? entryTag.volume     : "";
	 		number    = (typeof(entryTag.number) 	!== 'undefined') ? entryTag.number     : "";	 		
	 		editor    = (typeof(entryTag.editor) 	!== 'undefined') ? entryTag.editor     : "";
	 		address   = (typeof(entryTag.address)	!== 'undefined') ? entryTag.address    : "";
	 		note      = (typeof(entryTag.note) 		!== 'undefined') ? entryTag.note       : "";	 		

	 	    // Creating a new pulication object with the extracted info.
	 		var currentPublication = new Publication(issn, author, booktitle, month, pages, realTitle, year, journal, url, volume, number, editor, address, note);

	 		// Adding publication to the array of publications
	 		publicationsArray.push(currentPublication);
	 	}

		// Rendering publications
		renderPublications();

		// ONLY for debugging: printing the Bibtext content but in JSON format.
		console.log(bibTextJSON);
		console.log(publicationsArray);
	 }

	/**
	 * Returns TRUE, if the input "x" is NaN. Returns NO, otherwise.
	 *
	 * @param x		Input that will be evaluated.
	 * @return TRUE, if the input "x" is NaN. Returns NO, otherwise.
	 */
	 function isNaN(x)
	 {
	 	return x !== x;
	 }

	/**
	 *	It renders the content extracted from the BibTex file.
	 * 
	 */
	 function renderPublications()
	 {
	 	if (isNaN(bibTextJSON) == false)
	 	{
		 	var htmlToRender = "";

		 	// Going through every publication.
		 	for (var i=0; i<publicationsArray.length; i++)
		 	{
		 		htmlToRender += "<p>";
		 		htmlToRender += publicationsArray[i].author;
		 		htmlToRender += "</p>";
		 	}

		 	// Inserting html into the div.
		 	$("." + PUBLICATIONS_DIV_CLASS_NAME).html(htmlToRender);
	 	}
	 }

})
(typeof exports === 'undefined' ? this['publications'] = {} : exports);

