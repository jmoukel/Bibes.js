
(function (exports)
{
	"use strict";

	/// CONSTANTS
	var BIBTEXT_FILE_URL 	 		           = "data/ivPCL.bib";
	var PUBLICATIONS_DIV_CLASS_NAME      = "publicationsDiv";
	var TIME_FILTER_SELECTION_CLASS_ID   = "#time-filter-selection"
	var TIME_FILTER_CLASS_ID     		     = "#time-filter"
	var AUTHOR_FILTER_CLASS_ID     		   = "#authors-filter";
	var AUTHOR_FILTER_SELECTION_CLASS_ID = "#authors-filter-selection";
	var SORTBY_FILTER_SELECTION_CLASS_ID = "#sortby-filter-selection";
	var SORTBY_FILTER_CLASS_ID 					 = "#sortby-filter";
	var CLEAR_BUTTON_CLASS_ID 					 = "#clear-button";
	var ALL_AUTHORS_TEXT							   = "ALL AUTHORS";
	var ALL_TIME_TEXT									   = "ALL TIME";
	var OLDER_TEXT											 = "OLDER";
	var SORT_BY_TEXT									   = "SORT BY:";
	var SORT_BY_MOST_RECENT_TEXT			   = "MOST RECENT";
	var SORT_BY_OLDEST_TEXT			   		   = "OLDEST";
	var NUMBER_OF_TIMES_IN_FILTER	  		 = 3;
	var NUMBER_OF_AUTHORS_IN_FILTER			 = 7;

	/// GLOBAL VARIABLES
	//
	/// Content of the bibtex file but in JSON format.
	var bibTextJSON;
	var publicationsArray;
	var yearsArray, typesArray, authorsArray;
	var selectedAuthor, selectedYear, selectedSortBy;

	/**************************
	 *	       OBJECTS        *
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
	 	this.url 	  	= url;
	 	this.volume 	= volume;
	 	this.number 	= number;
	 	this.editor 	= editor;
	 	this.address 	= address;
	 	this.note 		= note;
	 }

	/**************************
	 *	  PUBLIC FUNCTIONS    *
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
		yearsArray		  = [];
		typesArray		  = [];
		authorsArray	  = [];

	 	// Extracting content from Bibtext file.
	 	startReadingBibtexFile(parseBibTexToJSON);

		// Setting initial filter values.
		setFilterDefaults();
  };

	/**************************
	 *	  PRIVATE FUNCTIONS   *
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

			// Checking the year is numberic
			if (isNumeric(year) == false)
				year = 0;

	 		// Adding year (if not added yet) to the array of years.
	 		insertYearInYearsArray(year);

	 		// Adding author (if not added yet) to the array of authors.
	 		insertAuthorsInAuthorsArray(author.split("and"));

	 	    // Creating a new pulication object with the extracted info.
	 		var currentPublication = new Publication(issn, author, booktitle, month, pages, realTitle, year, journal, url, volume, number, editor, address, note);

	 		// Adding publication to the array of publications
	 		publicationsArray.push(currentPublication);
	 	}

	 	// Rendering everything
	 	renderAll();

		// ONLY for debugging: printing the Bibtext content but in JSON format.
		console.log(bibTextJSON);
		console.log(publicationsArray);
		console.log(authorsArray);
	 }

	 /**
	  * Returns TRUE, if the input "n" is numeric. FALSE, otherwise.
	  *
	  * @param n		value which will be determined if it's numeric or not.
	  * @return TRUE, if the input "n" is numeric. FALSE, otherwise.
	  */
	 function isNumeric(n)
	 {
  		return !isNaN(parseFloat(n)) && isFinite(n);
	 }

	/**
	 * Returns TRUE, if the input "x" is NaN. Returns FALSE, otherwise.
	 *
	 * @param x		Input that will be evaluated.
	 * @return TRUE, if the input "x" is NaN. Returns FALSE, otherwise.
	 */
	 function isNaN(x)
	 {
	 	return x !== x;
	 }

	/**
	 *	It renders all: filters and publications.
	 *
	 */
	 function renderAll()
	 {
	 	// Sorting filters arrays.
	 	sortFilterArrays();

	 	// Rendering filters
	 	renderFilters();

		// Rendering publications
		renderPublications();
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
		 	var publications = getPublicationFromFilters();

		 	// Going through every publication.
		 	for (var i=0; i<publications.length; i++)
		 	{
				// Starting Row
				if (i % 2 !== 0)
		 	  	htmlToRender += "<tr><td class='col-lg-1 col-md-1 col-sm-1 col-xm-1'></td>";
				else
				  htmlToRender += "<tr style='background-color:#F6F6F6'><td class='col-lg-1 col-md-1 col-sm-1 col-xm-1'></td>";

		 		// Year
		 		htmlToRender += "<td class='col-lg-2 col-md-2 col-sm-2 col-xm-2 text-center ivcpl-publication-year'>";
		 		htmlToRender += publications[i].year.length !== 0 && publications[i].year != 0 ? publications[i].year : "-";
		 		htmlToRender += "</td>";

		 		// Description
		 		htmlToRender += "<td class='col-lg-6 col-md-6 col-sm-6 col-xm-6 text-left'>";
		 		htmlToRender += "<div class='ivcpl-publication-description-title'>";
		 		htmlToRender += publications[i].booktitle.length !== 0 ? publications[i].booktitle : "Unknown Title";
		 		htmlToRender += "</div>";
		 		htmlToRender += "<div class='ivcpl-publication-description-subtitle'>";
		 		htmlToRender += publications[i].author;
		 		htmlToRender += "</div>";
		 		htmlToRender += "</td>";

		 		// Downloads
		 		htmlToRender += "<td class='col-lg-1 col-md-1 col-sm-1 col-xm-1 text-center ivcpl-publication-downloads'>";
		 		if (publications[i].url.length !== 0)
		 			htmlToRender += "<a target='_blank' href='"+ publications[i].url +"'><img src='pics/urlIcon.png'></a>";
		 		htmlToRender += "</td>";

		 		// Ending row
		 		htmlToRender += "<td class='col-lg-2 col-md-2 col-sm-2 col-xm-2'></td></tr>";
		 	}

			// Showing Empty List Message, if necessary.
			if (publications.length == 0)
				htmlToRender = "<tr><td class='col-lg-6 col-md-6 col-lg-offset-3 col-md-offset-3 ivcpl-publication-description-subtitle text-center'>No publications found</td></tr>";

		 	// Inserting html into the div.
		 	$("#" + PUBLICATIONS_DIV_CLASS_NAME).html(htmlToRender);
	 	}
	 }

	/**
	 * It renders the filters' options.
	 *
	 */
	 function renderFilters()
	 {
	 		// Selecting the most recent years as options for the Time filter.
			$(TIME_FILTER_CLASS_ID).html("");
		  $(TIME_FILTER_CLASS_ID).append("<li><a href='#'>" + ALL_TIME_TEXT + "</a></li>");
	 		for (var i=0; i<yearsArray.length && i<NUMBER_OF_TIMES_IN_FILTER; i++)
				$(TIME_FILTER_CLASS_ID).append("<li><a href='#'>" + yearsArray[i].toUpperCase() + "</a></li>");
			$(TIME_FILTER_CLASS_ID).append("<li><a href='#'>" + OLDER_TEXT + "</a></li>");

			// Selecting the first 5 authors with the most publications.
			$(AUTHOR_FILTER_CLASS_ID).html("");
		  $(AUTHOR_FILTER_CLASS_ID).append("<li><a href='#'>" + ALL_AUTHORS_TEXT + "</a></li>");
	 		for (var i=0; i<authorsArray.length && i<NUMBER_OF_AUTHORS_IN_FILTER; i++)
				$(AUTHOR_FILTER_CLASS_ID).append("<li><a href='#'>" + authorsArray[i][0].toUpperCase() + "</a></li>");

			// Adding sorting typesArray
			$(SORTBY_FILTER_CLASS_ID).html("");
		  $(SORTBY_FILTER_CLASS_ID).append("<li><a href='#'>" + SORT_BY_MOST_RECENT_TEXT + "</a></li>");
		  $(SORTBY_FILTER_CLASS_ID).append("<li><a href='#'>" + SORT_BY_OLDEST_TEXT + "</a></li>");
	 }

	/**
	 * It returns the list of publications to be shown to the user taking into account the selections of each filter.
	 *
	 */
	 function getPublicationFromFilters()
	 {
		 var filteredPublicationsArray = [];

		 for (var i=0; i<publicationsArray.length; i++)
		 {
			  var publicationSufficesAllFilters = true;
				var content;

		  	// Checking the Time filter.
				content = $(TIME_FILTER_SELECTION_CLASS_ID).html();
				if (content.indexOf(ALL_TIME_TEXT) === -1)
				{
					// Cleaning content.
					content = content.replace('TIME:', '');
					content = content.replace('<span class="caret"></span>', '');
					content = content.replace(/ /gi, '');
					content = content.replace('&lt;', '< ');

					if (content.localeCompare(OLDER_TEXT) === 0)
					{
						for (var k=0; k<yearsArray.length && k<NUMBER_OF_TIMES_IN_FILTER; k++)
						{
							if (publicationsArray[i].year == yearsArray[k])
								publicationSufficesAllFilters = false;
						}
					}
					else if ((publicationsArray[i].year + "").indexOf(content) === -1)
						publicationSufficesAllFilters = false;
				}

		  	// Checking the Authors filter.
				content = $(AUTHOR_FILTER_SELECTION_CLASS_ID).html();
				if (content.indexOf(ALL_AUTHORS_TEXT) === -1 &&
					  publicationSufficesAllFilters)
				{
					// Cleaning content.
					content = content.replace('AUTHOR:', '');
					content = content.replace('<span class="caret"></span>', '');
					content = content.replace(/ /gi, '');

					if (publicationsArray[i].author.toUpperCase().indexOf(content) === -1)
						publicationSufficesAllFilters = false;
				}

				// Adding filtered publication to the array of publications to be shown to the user.
				if (publicationSufficesAllFilters)
					filteredPublicationsArray.push(publicationsArray[i]);
		 }

		 // Cleaning content.
		 content = $(SORTBY_FILTER_SELECTION_CLASS_ID).html();
		 content = content.replace('<span class="caret"></span>', '');
		 content = content.replace(/ /gi, '');

		 // Checking the SortBy filter.
		 if (content.length !== 0)
		 {
			   if (content.indexOf(SORT_BY_MOST_RECENT_TEXT) !== -1)
				 {
					 	filteredPublicationsArray.sort(function(a, b) {return b.year - a.year});;
				 }
			   else if (content.indexOf(SORT_BY_OLDEST_TEXT) !== -1)
				 {
					 	filteredPublicationsArray.sort(function(a, b) {return a.year - b.year});;
				 }
		 }

		 console.log(filteredPublicationsArray);

	 		return filteredPublicationsArray;
	 }

	/**
	 * It sorts all the arrays related to the filters.
	 *
	 */
	 function sortFilterArrays()
	 {
		 	yearsArray.sort(function(a, b) {return b - a});
	 		authorsArray.sort(function(a, b) {return b[1] - a[1]});

			if (NUMBER_OF_TIMES_IN_FILTER <= yearsArray.length)
				OLDER_TEXT = "< " + yearsArray[NUMBER_OF_TIMES_IN_FILTER - 1]
	 }

	 	/**
	 	 * It sets the default values for all the filters.
	 	 *
	 	 */
	 function setFilterDefaults()
	 {
	 		handleFilterSelection(ALL_TIME_TEXT, TIME_FILTER_SELECTION_CLASS_ID);
	 		handleFilterSelection(ALL_AUTHORS_TEXT, AUTHOR_FILTER_SELECTION_CLASS_ID);
	 		handleFilterSelection(SORT_BY_TEXT, SORTBY_FILTER_SELECTION_CLASS_ID);
   }

	/**
	 * It handles the selection given by input "newSelection" made by the user in the filter which id is given by input "filterClassId".
	 *
	 * @param newSelection		Selection made by the user in the Time Filter.
	 * @param filterClassId		ID of the class of the filter where the selection was made.
	 */
	 function setFilterSelection(newSelection, filterClassId)
	 {
	 	if (newSelection.length !== 0)
	 	{
	 		$(filterClassId).empty();
	 		$(filterClassId).append(newSelection + '<span class="caret"></span>');

	 		// Printing for debugging
			console.log(newSelection);
	 	}
	 }

	/**
	 * It inserts the input year "year" in the array of years.
	 *
	 * @param year		Year to be inserted.
	 */
	 function insertYearInYearsArray(year)
	 {
 			if (year.length !== 0 &&
 				  jQuery.inArray( year, yearsArray ) === -1)
 			yearsArray.push(year);
	 }

	/**
	 * It inserts the authors found in input "sub_authorsArray" into the authors' array.
	 *
	 * @param year		Year to be inserted.
	 */
	 function insertAuthorsInAuthorsArray(sub_authorsArray)
	 {
 		for (var j=0; j<sub_authorsArray.length; j++)
 		{
	 		if (sub_authorsArray[j].length !== 0)
	 		{
 				var indexOfAuthor = -1;
 				var newAuthor = sub_authorsArray[j];

 				// Cleaning new author name.
 				newAuthor = newAuthor.split(",")[0];
 				newAuthor = newAuthor.replace(/ /gi, '');

 				// Checking if this author is already in the array
 				for (var i=0; i<authorsArray.length; i++)
 				{
 					if (authorsArray[i][0].localeCompare(newAuthor) == 0)
 					{
 						indexOfAuthor = i;
 						break;
 					}
 				}

				// Inserting author
	 			if (indexOfAuthor === -1)
	 				authorsArray.push([newAuthor, 1]);
	 			else
	 				authorsArray[indexOfAuthor] = [newAuthor, authorsArray[indexOfAuthor][1] + 1];
	 		}
 		}
	 }

	/**
	 * It handles the selection given by input "selection" made by the user in the filter which id is given by input "filterClassId".
	 *
	 * @param selection		    Selection made by the user in the Time Filter.
	 * @param filterClassId		ID of the class of the filter where the selection was made.
	 */
	 function handleFilterSelection(selection, filterClassId)
	 {
	 	if (selection.length !== 0)
	 	{
	 		// Setting new selectiong in filter.
	 		setFilterSelection(selection, filterClassId);

			// Rendering publications again to reflect the selection.
			renderPublications();
	 	}
	 }

	/**************************
	 *     EVENT HANDLERS     *
	 **************************/

	/**
	 *	It handles the clicks in the search TIME filter.
	 */
	$(function()
	{
    	$(TIME_FILTER_CLASS_ID).bind('click', function (e) {
    		handleFilterSelection(e.target.innerHTML, TIME_FILTER_SELECTION_CLASS_ID);
    	});
	});

	/**
	 *	It handles the clicks in the search AUTHORS filter.
	 */
	$(function()
	{
    	$(AUTHOR_FILTER_CLASS_ID).bind('click', function (e)
			{
				if (e.target.innerHTML.localeCompare(ALL_AUTHORS_TEXT) == 0)
    			handleFilterSelection(e.target.innerHTML, AUTHOR_FILTER_SELECTION_CLASS_ID);
				else
    			handleFilterSelection("AUTHOR: " + e.target.innerHTML, AUTHOR_FILTER_SELECTION_CLASS_ID);
    	});
	});

	/**
	 *	It handles the clicks in the search SORTBY filter.
	 */
	$(function()
	{
    	$(SORTBY_FILTER_CLASS_ID).bind('click', function (e) {
    		handleFilterSelection(SORT_BY_TEXT + " " + e.target.innerHTML, SORTBY_FILTER_SELECTION_CLASS_ID);
    	});
	});

	/**
	 *	It handles the clicks in the Clear button.
	 */
	$(function()
	{
    	$(CLEAR_BUTTON_CLASS_ID).bind('click', function (e) {
	    		setFilterDefaults();
    	});
	});
})
(typeof exports === 'undefined' ? this['publications'] = {} : exports);
