;(function($){
    'use strict';

    var ddFull, ddThumb, ddSingle;

    //APP CONFIGURATION
    var conf = {
        ddError: '.js-dd__err',
        ddList: '.js-dd__list',
        err: {
            tooMany: 'The number of files you are attempting to upload exceeds the file limit.',
            tooBig: 'This file exceeds the file size limit: ',
            wrongType: 'This file is the wrong file type: '
        },
        sub: {
            fail: 'There was a problem with the submission. Please try again.'
        }
    };

    //DOM SELECTIONS
    var ddForm          = document.getElementById('ddform'),
        ddFullEl0       = document.getElementById('ddfull0'),
        ddFullEl1       = document.getElementById('ddfull1'),
        ddThumbEl0      = document.getElementById('ddthumb0'),
        ddThumbEl1      = document.getElementById('ddthumb1'),
        ddSingleEl0     = document.getElementById('ddsingle0'),
        ddSingleEl1     = document.getElementById('ddsingle1');

    //HANDLEBARS.JS TEMPLATES
    var fullTemplate    = Handlebars.compile( document.getElementById('ddlistfulltemp').innerHTML ),
        thumbTemplate   = Handlebars.compile( document.getElementById('ddlistthumbtemp').innerHTML ),
        singleTemplate  = Handlebars.compile( document.getElementById('ddlistsingletemp').innerHTML );





    //HEMULEN.JS INSTANTIATIONS


    //Instance 1
    ddFull = new Hemulen({
        hemulen: '.js-dd--full',
        namespace: 'ddfull',
        dropInput: '.js-dd__field',
        fileInput: '.js-dd__file-inpt',
        acceptTypes: ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/bmp'],
        fileMaxSize: 5000000,
        fileLimit: 5
    });

    //Instance 2
    ddThumb = new Hemulen({
        hemulen: '.js-dd--thumb',
        namespace: 'ddthumb',
        dropInput: '.js-dd__field',
        fileInput: '.js-dd__file-inpt',
        acceptTypes: ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/bmp'],
        fileMaxSize: 5000000,
        fileLimit: 10
    });

    //Instance 3
    ddSingle = new Hemulen({
        hemulen: '.js-dd--single',
        namespace: 'ddsingle',
        dropInput: '.js-dd__field',
        fileInput: '.js-dd__file-inpt',
        acceptTypes: ['application/pdf'],
        fileMaxSize: 5000000,
        fileLimit: 1
    });





    //EVENT HANDLERS

    //General events

    function _onFileStoredFull(e){
        var reader          = new FileReader();

        reader.onload = function(readerE){
            $(e.detail.instance).find(conf.ddList).append(thumbTemplate({
                name: e.detail.file.name,
                fileId: e.detail.fileId,
                thumbSrc: readerE.target.result
            }));
        };

        reader.readAsDataURL(e.detail.file);

        console.log('hemulen-filestored', e);
    }

    function _onFileStoredThumb(e){
        var reader = new FileReader();

        reader.onload = function(readerE){
            $(e.detail.instance).find(conf.ddList).append(thumbTemplate({
                name: e.detail.file.name,
                fileId: e.detail.fileId,
                thumbSrc: readerE.target.result
            }));
        };

        reader.readAsDataURL(e.detail.file);

        console.log('hemulen-filestored', e);
    }

    function _onFileStoredSingle(e){    
        $(e.detail.instance).find(conf.ddList).html(singleTemplate({
            name: e.detail.file.name,
            fileId: e.detail.fileId
        }));

        console.log('hemulen-filestored', e);
    }


    //Error events

    function _onTooBig(e){
        var errMessage = document.createElement('p');
            errMessage.textContent = conf.err.tooBig + e.detail.file.name;

        $(e.detail.instance).find(conf.ddError).append(errMessage);

        console.log('hemulen-toomany', e);
    }
    
    function _onTooMany(e){
        var errMessage = document.createElement('p');
            errMessage.textContent = conf.err.tooMany;

        $(e.detail.instance).find(conf.ddError).append(errMessage);

        console.log('hemulen-toobig', e);
    }
    
    function _onWrongType(e){
        var errMessage = document.createElement('p');
            errMessage.textContent = conf.err.wrongType + e.detail.file.name;

        $(e.detail.instance).find(conf.ddError).append(errMessage);

        console.log('hemulen-wrongtype', e);
    }
    

    //Form submission events

    function _onSubSuccess(e){
        console.log('hemulen-subsuccess', e);

        window.location = (JSON.parse(e.detail.request.response)).redirectUrl;
    }
    
    function _onSubFailure(e){
        console.log('hemulen-subfailure', e);
    }





    //EVENT LISTENERS

    ddForm.addEventListener('hemulen-subsuccess', _onSubSuccess, false);
    ddForm.addEventListener('hemulen-subfailure', _onSubFailure, false);


    ddFullEl0.addEventListener('hemulen-filestored', _onFileStoredFull, false); 
    ddFullEl0.addEventListener('hemulen-toomany', _onTooMany, false);
    ddFullEl0.addEventListener('hemulen-toobig', _onTooBig, false);  
    ddFullEl0.addEventListener('hemulen-wrongtype', _onWrongType, false);

    ddFullEl1.addEventListener('hemulen-filestored', _onFileStoredFull, false); 
    ddFullEl1.addEventListener('hemulen-toomany', _onTooMany, false);
    ddFullEl1.addEventListener('hemulen-toobig', _onTooBig, false);  
    ddFullEl1.addEventListener('hemulen-wrongtype', _onWrongType, false);


    ddThumbEl0.addEventListener('hemulen-filestored', _onFileStoredThumb, false);
    ddThumbEl0.addEventListener('hemulen-toomany', _onTooMany, false);
    ddThumbEl0.addEventListener('hemulen-toobig', _onTooBig, false);  
    ddThumbEl0.addEventListener('hemulen-wrongtype', _onWrongType, false);

    ddThumbEl1.addEventListener('hemulen-filestored', _onFileStoredThumb, false);
    ddThumbEl1.addEventListener('hemulen-toomany', _onTooMany, false);
    ddThumbEl1.addEventListener('hemulen-toobig', _onTooBig, false);  
    ddThumbEl1.addEventListener('hemulen-wrongtype', _onWrongType, false);


    ddSingleEl0.addEventListener('hemulen-filestored', _onFileStoredSingle, false);
    ddSingleEl0.addEventListener('hemulen-toomany', _onTooMany, false);
    ddSingleEl0.addEventListener('hemulen-toobig', _onTooBig, false);  
    ddSingleEl0.addEventListener('hemulen-wrongtype', _onWrongType, false);

    ddSingleEl1.addEventListener('hemulen-filestored', _onFileStoredSingle, false);
    ddSingleEl1.addEventListener('hemulen-toomany', _onTooMany, false);
    ddSingleEl1.addEventListener('hemulen-toobig', _onTooBig, false);  
    ddSingleEl1.addEventListener('hemulen-wrongtype', _onWrongType, false);
}(jQuery));








