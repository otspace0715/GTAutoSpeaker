/*
 * GTAS Options
 *
 * This file contains user options funcrions
 *
 * @package		GTAS
 * @category	Options
 * @author		o.tanaka
 */
	var element = {},
		bg = chrome.extension.getBackgroundPage(),
		vars = [
					'percents', 'interval', 'playback', 'playback_hotkeys', 'playback_hotkey', 'options_title'
				];
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Create local variables and get their values
 * ---------------------------------------------------------------------------------------------------------------------
*/
	function set_vars(vars)
	{
		for (key in vars)
  		{
  			key = vars[key];
 			if(document.getElementById(key) != null)
 			{
 				element[key] = document.getElementById(key);
 			}
 			else
 			{
 				element[key] = '';
 			}
  		}
	}	
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Initialise Event listeners
 * ---------------------------------------------------------------------------------------------------------------------
*/
function init_listeners()
{

	element.playback.addEventListener('change', function() {
		save_options();
	}, false);

	element.interval.addEventListener('change', function() {
		element.percents.innerHTML = parseInt(this.value)+' %';
		save_options();
	}, false);
	
	element.playback_hotkeys.addEventListener("keydown", function(e){
		keyDown(e,0);
		save_options();
	}, false);

		

}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Check if Local Storage is avalible
 * ---------------------------------------------------------------------------------------------------------------------
*/
function checkLocalStorage()
{
	if (window.localStorage == null) 
	{
		alert("LocalStorage must be enabled for changing options.");
		return false;
	}
	return true;
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get current version
 * ---------------------------------------------------------------------------------------------------------------------
*/
function getVersion()
{
    var details = chrome.app.getDetails();
    return details.version;
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get languages supported by chrome *** experimental feature
 * ---------------------------------------------------------------------------------------------------------------------
*/
function getLanguages(current)
{
	for(langs in languages)
	{
		var opt = document.createElement('option');	
		if (languages[langs].language == current)
		{
			opt.setAttribute('selected', 'selected');
		}
		opt.setAttribute('value', languages[langs].language);
		opt.innerText = languages[langs].name;
		language.appendChild(opt);
	}	
}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Save user defined options
 * ---------------------------------------------------------------------------------------------------------------------
*/
function save_options()
{
	
	if(!checkLocalStorage()) return;

	localStorage.clear();
	
  	var options =
	{
		version : getVersion(),
		interval : element.interval.value,
		playback : element.playback.checked,
		playback_hotkeys: element.playback_hotkey
	}

	localStorage.setItem("options", JSON.stringify(options));
  	bg.setOptions(options);
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get user defined options
 * ---------------------------------------------------------------------------------------------------------------------
*/
function restore_options()
{
	options = JSON.parse(localStorage.getItem("options"));
	element.options_title.innerHTML = 'GT Auto Speaker v'+getVersion();
	element.interval.value = options.interval;
	element.percents.innerHTML = parseInt(options.interval)+' %';
	element.playback.checked = options.playback;
	element.playback_hotkeys.value = getHotkeys(options.playback_hotkeys);
	element.playback_hotkey = options.playback_hotkeys;
}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get user defined keyboard shortcut
 * ---------------------------------------------------------------------------------------------------------------------
*/
function getHotkeys(keys)
{

	if (keys == undefined) {
		return null;
	}
	return keys.substr(0,keys.lastIndexOf('+')+2)+CharCode(keys.substr(keys.lastIndexOf('+')+2,2));	
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Convert's char code to char
 * ---------------------------------------------------------------------------------------------------------------------
*/
function CharCode(code)
{
	return String.fromCharCode(code).toLowerCase();		
}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Save user defined options
 * ---------------------------------------------------------------------------------------------------------------------
*/
function keyDown(e,kb)
{
	out = "";
	if(e.ctrlKey) out += "ctrl + ";
	if(e.shiftKey) out += "shift + ";
	if(e.altKey) out += "alt + ";
	if(e.metaKey) out += "meta + ";
	code = e.keyCode;
	code = code == 16 ||code == 17 ||code == 18?null:code;
	e.target.value = out + CharCode(code);
	if(kb == 0)
	{
		element.playback_hotkey = out + code;		
	}
	else
	{
		sec_hotkey = out + code;		
	}
	e.preventDefault();
	return false;
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Load extension localized messages and descriptions
 * ---------------------------------------------------------------------------------------------------------------------
*/
function setLocales()
{
	locales = document.getElementsByClassName('locale');
	locales = Array.prototype.slice.call(locales);
	
	for(i=0;locales.length;i++)
	{
		if(locales[i] === undefined) break; //Fix 4 Uncaught error
		if(chrome.i18n.getMessage(locales[i].id) != '')
		{
				locales[i].innerHTML = chrome.i18n.getMessage(locales[i].id);				
		}
	}
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Init main options variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/
(function()
{
	set_vars(vars);
	init_listeners();
	restore_options();
	setLocales();
})();