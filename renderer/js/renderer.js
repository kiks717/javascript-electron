
const formImg = document.querySelector('#img-form');
const img = document.querySelector('#img'); //this is input
const outputPath = document.querySelector('#output-path');//span
const filename = document.querySelector('#filename');//span
const heightInput = document.querySelector('#height');//input
const widthInput = document.querySelector('#width');//input

function loadImage(e){
    const file = e.target.files[0];
    //check if file is image 
    if(!isFileImage(file)){
        alertError('Please select an image');
        return;
    }
    //Get original dimensions
    const image  = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function() {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }
    /*
    Preload scripts
    Preload scripts are injected before a web page 
    loads in the renderer, similar to a Chrome extension's 
    content scripts. To add features to your renderer that 
    require privileged access, 
    you can define global objects through the contextBridge API.
    To demonstrate this concept, you will create a preload script 
    that exposes your app's
    versions of Chrome, Node, and Electron into the renderer.

    Add a new preload.js script that exposes selected properties of 
    Electron's process.versions 
    object to the renderer process in a versions global variable.
    ContextBrige  -- -webPreferences
    */
    
    formImg.style.display = 'block';
    filename.innerHTML = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}
//Send image data to main.js
function sendImage(e){
    const width = widthInput.value;
    const height = heightInput.value;
    const imagePath = img.files[0].path;

    e.preventDefault();
    if(!img.files[0]){
        alertError("Please upload an image");
        return;
    }

    if(width === '' || height === ''){
        alertError("Please fill in height and width");
        return;
    }

    //Send to main using ipcRenderer(included in Electron)
    ipcRenderer.send('image:resize', {
        imagePath,
        width, 
        height
    });

}
//Catch the image:done event
//let users know visually that the image is resized 
ipcRenderer.on('image:done', () => {
    alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`)
})
//make sure file is image
function isFileImage(file){
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
    return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message){
    Toastify.toast({
        text : message,
        duration : 5000,
        close : false,
        style : {
            background : 'red',
            color: 'white',
            textAlign : 'center'
        }
    })
}
function alertSuccess(message){
    Toastify.toast({
        text : message,
        duration : 5000,
        close : false,
        style : {
            background : 'green',
            color: 'white',
            textAlign : 'center'
        }
    })
}
img.addEventListener('change', loadImage);
formImg.addEventListener('submit', sendImage);