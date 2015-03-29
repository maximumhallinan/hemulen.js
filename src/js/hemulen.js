;(function(){
    'use strict';

    //MODULE GLOBALS
    var filesStored     = {};
    var usedHashes      = [];
    var beforeSub       = [];
    var formSubmitted   = false; 





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
                if(options.hasOwnProperty(key)) {
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
        // |- Hemulen File Storage object
        // |   |- namespace
        // |   |   |- hemulenElId
        // |   |   |   |- fileId
        // |   |   |   |   |- file
        // |   |   |   |   |- foo
        // |   |   |   |   |- bar

        var propname    = '';
        var counterA    = 0;
        var counterB    = 0;

            for (var foo in storedData) {
                if (storedData.hasOwnProperty(foo)){
                    propname    = foo;
                    
                    if (storedData[foo].constructor === Object) {
                        for (var bar in storedData[foo]) {
                            if (storedData[foo].hasOwnProperty(bar)) {
                                
                                if (storedData[foo][bar].constructor === Object) {    
                                    for (var baz in storedData[foo][bar]) {
                                        if (storedData[foo][bar].hasOwnProperty(baz)) {
                                            
                                            if (storedData[foo][bar][baz].constructor === Object) {
                                                for (var qux in storedData[foo][bar][baz]) {
                                                    if(storedData[foo][bar][baz].hasOwnProperty(qux)) {
                                                        formData.append((propname + counterA + qux + counterB), storedData[foo][bar][baz][qux]);
                                                    }
                                                }
                                
                                                counterB++;
                                            }

                                          
                                        }
                                    }
                                
                                    counterA++;  
                                    counterB = 0;
                                }
                                                      
                            }
                        }
                    }

                    counterA = 0;
                }
            }

            return formData;
    }





    //EVENT HANDLERS

    function _onFileChange(e){
        this.storeFiles(this.getHemulenElId(_closest(e.target, this.hemulenEl)), e.target.files);
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
        this.storeFiles(this.getHemulenElId(_closest(e.target, this.hemulenEl)), e.dataTransfer.files);
        return false;
    }
    
    function _onSub(e){
        var i, j; 

        e.preventDefault && e.preventDefault();
        
        if (!formSubmitted) {
            for (i = 0, j = beforeSub.length; i < j; i++) {beforeSub[i](e, this);}
            this._subData(e.target);
        }
        formSubmitted = true;
    }





    //HEMULEN CLASS

    function Hemulen(options){
        this.hemulenEl      = undefined;
        this.namespace      = undefined;
        this.dropInput      = undefined;
        this.fileInput      = undefined;
        this.acceptTypes    = undefined;
        this.fileMaxSize    = undefined;
        this.fileLimit      = undefined;
        this.beforeSub      = undefined;

        if (!options || options.constructor !== Object) {
            throw new Error('Invalid Hemulen configuration.');
        } else {
            _extend.call(this, options);
        }
        
        if (!this.hemulenEl || this.hemulenEl.constructor !== String){throw new Error('hemulenEl is a required configuration option and must be a CSS selector string.');}
        if (!this.dropInput || this.dropInput.constructor !== String){throw new Error('dropInput is a required configuration option and must be a CSS selector string.');}
        if (!this.namespace || this.namespace.constructor !== String){throw new Error('namespace is a required configuration option and must be a CSS selector string.');}

        this._init();
    }





    //HEMULEN "PRIVATE" METHODS

    Hemulen.prototype._init = function(){
        var els = document.querySelectorAll(this.hemulenEl);
        this._instances = {};
        filesStored[this.namespace] = {};

        for (var i = 0, l = els.length, hemulenElId; i < l; i++) {
            hemulenElId = _generateUniqueHash(_generateHash, 7, usedHashes);
            this._instances[hemulenElId] = els[i];
            filesStored[this.namespace][hemulenElId] = {};
        }

        if (this.beforeSub && this.beforeSub.constructor === Function){beforeSub.push(this.beforeSub);}

        this._bindEventListeners();
    };

    Hemulen.prototype._bindEventListeners = function(){
        var i; 
        var j; 
        var k; 
        var l;
        var key; 
        var el;
        var dropForm;
        var dropInput;
        var fileInput;

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

    Hemulen.prototype._setUploadLimit = function(hemulenElId, files){
        var instance            = this._instances[hemulenElId];
        var filesStoredLength   = Object.keys(filesStored[this.namespace][hemulenElId]).length;
        var filesLength         = files.length;
        var filesLimit          = this.fileLimit - filesStoredLength;
        var range               = {};
        var ev;
        var eventDetail;
        var s;

        if (filesLength > filesLimit) {
            eventDetail = {
                instance: instance,
                hemulenElId: hemulenElId,
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

    Hemulen.prototype._validFile = function(hemulenElId, file){
        var isValidType = this.acceptTypes ? this.acceptTypes.indexOf(file.type) > -1 : true;
        var isValidSize = this.fileMaxSize ? this.fileMaxSize > file.size : true;
        var instance    = this._instances[hemulenElId];
        var eventDetail = {
                instance: instance,
                hemulenElId: hemulenElId,
                file: file,
                hemulen: this
            };
        var ev;            

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

    Hemulen.prototype._storeFile = function(hemulenElId, file){
        var fileId = _generateUniqueHash(_generateHash, 7, usedHashes);

        filesStored[this.namespace][hemulenElId][fileId] = {};
        filesStored[this.namespace][hemulenElId][fileId]['file'] = file; 
        
        if (filesStored[this.namespace][hemulenElId][fileId]['file'] === file) {
            var eventDetail = {
                instance: this._instances[hemulenElId],
                hemulenElId: hemulenElId,
                file: file,
                fileId: fileId,
                hemulen: this
            };
            var ev = _createEvent('hemulen-filestored', true, true, eventDetail);
            
            this._instances[hemulenElId].dispatchEvent(ev);
        } else {
            return null;
        }
    };

    Hemulen.prototype._subData = function(form){
        var req     = new XMLHttpRequest();
        var route   = form.getAttribute('action');
            
        req.onreadystatechange = function(){
            if (req.readyState === 4) {
                var ev;
                var eventDetail = {request: req};
                
                ev = req.status === 200 ?   _createEvent('hemulen-subsuccess', true, true, eventDetail) : 
                                            _createEvent('hemulen-subfailure', true, true, eventDetail);

                form.dispatchEvent(ev);
                
                formSubmitted = false;            
            }
        };

        req.open('POST', route, true);
        req.send( _createSubData(filesStored, new FormData(form)) );
    };


    //HEMULEN "PUBLIC" METHODS

    Hemulen.prototype.getHemulenElId = function(element){

        if (!element || typeof element !== 'object' || !element.nodeType || element.nodeType !== 1) {
            throw new Error('The first argument must be an element node');
        }

        for (var key in this._instances) {
            if (this._instances[key] === element) {
                return key;
            }
        }

        return undefined;
    };

    Hemulen.prototype.getFileId = function(hemulenElId, file){
        if (!hemulenElId || hemulenElId.constructor !== String) {throw new Error('This is an invalid value: ', hemulenElId);}

        for (var key in filesStored[hemulenElId]) {
            if (filesStored[hemulenElId][key][file] === file) {
                return key;
            } 
        }

        return undefined;
    };

    Hemulen.prototype.deleteFile = function(hemulenElId, fileId){
        var ev;
        var eventDetail;

        if (!hemulenElId || hemulenElId.constructor !== String) {throw new Error('This is an invalid value: ', hemulenElId);}
        if (!hemulenElId || hemulenElId.constructor !== String) {throw new Error('This is an invalid value: ', fileId);}
        
        delete filesStored[this.namespace][hemulenElId][fileId];

        if (!filesStored[this.namespace][hemulenElId][fileId]) {
            eventDetail = {
                instance: this._instances[hemulenElId],
                fileId: fileId,
                hemulenElId: hemulenElId,
                hemulen: this
            };
            ev = _createEvent('hemulen-filedeleted', true, true, eventDetail);
            ev.hello = "hello world";
            this._instances[hemulenElId].dispatchEvent(ev);            
        }

        return false;
    };

    Hemulen.prototype.storeFiles = function(hemulenElId, files){
        var range;

        if (!hemulenElId || hemulenElId.constructor !== String) {throw new Error('This is an invalid value: ', hemulenElId);}

        range = this.fileLimit ? this._setUploadLimit(hemulenElId, files) : {start: 0, end: files.length}; 

        for (var i = range.start; i < range.end; i++) {
            if ( this._validFile(hemulenElId, files[i - range.start]) ) {
                this._storeFile(hemulenElId, files[i - range.start]);
            }
        }
    };

    Hemulen.prototype.addData = function(hemulenElId, fileId, updates){
        if (!hemulenElId || hemulenElId.constructor !== String) {throw new Error('This is an invalid value: ', hemulenElId);}
        if (!fileId || fileId.constructor !== String) {throw new Error('This is an invalid value: ', fileId);}
        if (!updates || updates.constructor !== Object) {throw new Error('This is an invalid value: ', updates);}
        
        for (var prop in updates) {
            if (updates.hasOwnProperty(prop) && (updates[prop].constructor === Object || updates[prop].constructor === Array) ) {
                throw new Error('The third argument is invalid. Values stored on the object must be primitives.');
            }
        }

        _extend.call(filesStored[this.namespace][hemulenElId][fileId], updates);        
    };


    //EXPORT HEMULEN
    if (typeof module !== "undefined" && module !== null) {
        module.exports = Hemulen;
    } else {
        window.Hemulen = Hemulen;
    }

})();