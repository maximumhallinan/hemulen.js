;(function(){
    'use strict';

    //MODULE GLOBALS
    var filesStored     = {},
        usedHashes      = [],
        formSubmitted   = false; 





    //UTILITY

    //Create and dispatch a custom event using one of two techniques, based on browser capability
    //Parameters: eventtarget (element node), eventname (string), eventbubbles (boolean), eventcancelable (boolean), eventdetail (object)
    var _createEvent = (function(){
        if (typeof CustomEvent === 'function') {
            return function(eventname, eventbubbles, eventcancelable, eventdetail){
                var ev = new CustomEvent(eventname, {
                    detail: eventdetail,
                    bubbles: eventbubbles,
                    cancelable: eventcancelable
                });
                return ev;
            };
        } else {
            //IE9+
            return function(eventname, eventbubbles, eventcancelable, eventdetail){
                var ev = document.createEvent('Event');
                ev.initEvent(eventname, eventbubbles, eventcancelable);
                if (eventdetail) {ev.detail = eventdetail;}
                return ev;
            }
        }
    })();

    //Generate a random hash of length equal to the value of the first argument
    function _generateHash(length){
        var hashSource = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'],
            hash = '';

        for (var i = 0; i < length; i++) {
            hash += hashSource[Math.floor(Math.random() * hashSource.length)];
        }

        return hash;
    }

    //Generate a random hash of length equal to the second argument 
    //by calling generator function passed as the first argument.
    //If new hash is equal to a value stored in array passed as the third argument,
    //recurse to generate new hash and check again.
    //Otherwise, return new hash.     
    function _generateUniqueHash(hashGenerator, hashLength, usedHashes){
        var newHash = hashGenerator(hashLength);
 
        return usedHashes.indexOf(newHash) > -1 ? _generateUniqueHash(hashGenerator, hashLength, usedHashes) : newHash; 
    }

    function _extend(options){
        for (var key in options) {
            if(options[key].constructor === Object) {
                _extend.call(this[key], options[key])
            } else {
                if(this.hasOwnProperty(key)) {
                    this[key] = options[key];
                }
            }
        }
    }

    function _closest(ele, selector) {
        var possibles = document.querySelectorAll(selector);

        return (function traverseUp(el){
            for (var i = 0, j = possibles.length; i < j; i++) {
                if (possibles[i] === el) {
                    return el;
                }
            }
            return traverseUp(el.parentNode);
        }(ele));
   
    }

    function _createSubData(storedData, formData){
        var propname    = '',
            counter     = 0;

            for (var foo in storedData) {
                if (storedData.hasOwnProperty(foo)){
                    propname    = foo;
                    
                    if (storedData[foo].constructor === Object) {
                        for (var bar in storedData[foo]) {
                            if (storedData[foo].hasOwnProperty(bar)) {
                                
                                if (storedData[foo][bar].constructor === Object) {    
                                    for (var baz in storedData[foo][bar]) {
                                        if (storedData[foo][bar].hasOwnProperty(baz)) {
                                            formData[propname + counter + baz] = storedData[foo][bar][baz];                                          
                                        }
                                    }
                                }
                                
                                counter++;                            
                            }
                        }
                    }

                    counter = 0;
                }
            }

            return formData;
    }


    //EVENT HANDLERS

    function _onFileChange(e){
        this.storeFiles(this.getInstanceId(_closest(e.target, this.hemulen)), e.target.files);
    }

    function _onDragEnter(e){
        e.preventDefault && e.preventDefault();
        return false;
    }
    
    function _onDragLeave(e){
        e.preventDefault && e.preventDefault();
        return false;
    }
    
    function _onDragOver(e){
        e.preventDefault && e.preventDefault();
        e.dataTransfer.dropEffect = 'all';
        return false;
    }
    
    function _onDrop(e){
        e.preventDefault && e.preventDefault();
        this.storeFiles(this.getInstanceId(_closest(e.target, this.hemulen)), e.dataTransfer.files);
        return false;
    }
    
    function _onSub(e){
        e.preventDefault && e.preventDefault();
        if (!formSubmitted) {}
        formSubmitted = true;
    }





    //HEMULEN CLASS

    function Hemulen(options){
        this.hemulen        = undefined;
        this.namespace      = undefined;
        this.dropInput      = undefined;
        this.fileInput      = undefined;
        this.acceptTypes    = undefined;
        this.fileMaxSize    = undefined;
        this.fileLimit      = undefined;
        this.beforeSub      = undefined;

        if (options) {_extend.call(this, options);}
        
        this._init();
    }





    //HEMULEN "PRIVATE" METHODS

    Hemulen.prototype._init = function(){
        var els = document.querySelectorAll(this.hemulen);
        this._instances = {};
        filesStored[this.namespace] = {};

        for (var i = 0, l = els.length, instanceId; i < l; i++) {
            instanceId = _generateUniqueHash(_generateHash, 7, usedHashes);
            this._instances[instanceId] = els[i];
            filesStored[this.namespace][instanceId] = {};
        }

        this._bindEventListeners();
    };

    Hemulen.prototype._bindEventListeners = function(){
        var i, j, k, l, key, el, dropForm, dropInput, fileInput;

        for (key in this._instances) {
            el          = this._instances[key],
            dropForm    = _closest(el, 'form'),
            dropInput   = el.querySelectorAll(this.dropInput),
            fileInput   = el.querySelectorAll(this.fileInput);

            //bind submit event
            dropForm.addEventListener('submit', _onSub.bind(this), false);
            
            //bind change event
            for (k = 0, l = fileInput.length; k < l; k++) {
                fileInput[k].addEventListener('change', _onFileChange.bind(this), false);
            }

            //bind drag/drop events
            for (k = 0, l = dropInput.length; k < l; k++) {
                dropInput[k].addEventListener('dragenter', _onDragEnter.bind(this), false);
                dropInput[k].addEventListener('dragleave', _onDragLeave.bind(this), false);
                dropInput[k].addEventListener('dragover', _onDragOver.bind(this), false);
                dropInput[k].addEventListener('drop', _onDrop.bind(this), false);
                dropInput[k].addEventListener('dragdrop', _onDrop.bind(this), false);
            }
          
        }
    };

    Hemulen.prototype._setUploadLimit = function(instanceId, files){
        var instance            = this._instances[instanceId],
            filesStoredLength   = Object.keys(filesStored[this.namespace][instanceId]).length,
            filesLength         = files.length,
            filesLimit          = this.fileLimit - filesStoredLength,
            range               = {},
            ev, eventDetail, s;

            if (filesLength > filesLimit) {
                eventDetail = {
                    instance: instance,
                    instanceId: instanceId,
                    files: files,
                    hemulen: this
                },
                ev = _createEvent('hemulen-toomany', true, true, eventDetail);  
                instance.dispatchEvent(ev);

                range.start = 0;
                range.end   = 0;
                return range;
            } else if (filesStoredLength === 0) {
                range.start = 0;
                range.end   = filesLength > this.fileLimit ? this.fileLimit : filesLength;  
            } else if (filesStoredLength < this.fileLimit && filesStoredLength > 0) {
                range.start = filesStoredLength;
                s = range.start + filesLength;
                range.end   = this.fileLimit < s ? this.fileLimit : s; 
            }

            return range;
    };

    Hemulen.prototype._validFile = function(instanceId, file){
        var isValidType = this.acceptTypes.indexOf(file.type) > -1,
            isValidSize = file.size < this.fileMaxSize,
            instance    = this._instances[instanceId], 
            eventDetail = {
                instance: instance,
                instanceId: instanceId,
                file: file,
                hemulen: this
            },
            ev;

            if (isValidType && isValidSize) {
                return true;
            } else if (!isValidType && !isValidSize) {
                ev = _createEvent('hemulen-wrongtype', true, true, eventDetail);
                instance.dispatchEvent(ev);
                ev = _createEvent('hemulen-toobig', true, true, eventDetail);
                instance.dispatchEvent(ev);
                return false;
            } else if (!isValidType && isValidSize) {
                ev = _createEvent('hemulen-wrongtype', true, true, eventDetail);
                instance.dispatchEvent(ev);
                return false;
            } else if (isValidType && !isValidSize) {
                ev = _createEvent('hemulen-toobig', true, true, eventDetail);
                instance.dispatchEvent(ev);
                return false;
            }
    };

    Hemulen.prototype._storeFile = function(instanceId, file){
        var fileId = _generateUniqueHash(_generateHash, 7, usedHashes);

        filesStored[this.namespace][instanceId][fileId] = file; 
        
        if (filesStored[this.namespace][instanceId][fileId] === file) {
            var eventDetail = {
                instance: this._instances[instanceId],
                instanceId: instanceId,
                file: file,
                fileId: fileId,
                hemulen: this
            },
            ev = _createEvent('hemulen-filestored', true, true, eventDetail);
            this._instances[instanceId].dispatchEvent(ev);
        } else {
            return null;
        }
    };


    //HEMULEN "PUBLIC" METHODS

    Hemulen.prototype.getInstanceId = function(element){
        for (var key in this._instances) {
            if (this._instances[key] === element) {
                return key;
            }
        }
        return undefined;
    };

    Hemulen.prototype.getFileId = function(instanceId, file){
        for (var key in filesStored[instanceId]) {
            if (filesStored[instanceId][key] === file) {
                return key;
            } 
        }
        return undefined;
    };

    Hemulen.prototype.deleteFile = function(instanceId, fileId){
        var ev, eventDetail;
        
        delete filesStored[instanceId][fileId];

        if (!filesStored[instanceId][fileId]) {
            eventDetail = {
                instance: this._instances[instanceId],
                instanceId: instanceId,
                hemulen: this
            };
            ev = _createEvent('hemulen-filedeleted', true, true, eventDetail);
            this._instances[instanceId].dispatchEvent(ev);            
        }

        return false;
    };

    Hemulen.prototype.storeFiles = function(instanceId, files){
        var range       = this._setUploadLimit(instanceId, files); 

        for (var i = range.start; i < range.end; i++) {
            if ( this._validFile(instanceId, files[i - range.start]) ) {
                this._storeFile(instanceId, files[i - range.start]);
            }
        }
    };

    Hemulen.prototype.addData = function(instanceId, fileId, updates){
        _extend.call(filesStored[instanceId][fileId], updates);        
    };


    //EXPORT HEMULEN
    if (typeof module !== "undefined" && module !== null) {
        module.exports = Hemulen;
    } else {
        window.Hemulen = Hemulen;
    }

})();