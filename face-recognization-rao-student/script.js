const imageUpload = document.getElementById('imageUpload');


Promise.all([
	faceapi.nets.faceRecognitionNet.loadFromUri('models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('models'),
	faceapi.nets.ssdMobilenetv1.loadFromUri('models')
	]).then(start)

async function start() {
	const container = document.createElement('div')
	container.style.position = 'relative'
	document.body.append(container)
	console.log("run 1!!!!!!!")
	const LabeledFaceDescriptors = await loadLabeledImage()
	console.log("LabeledFaceDescriptors==========",LabeledFaceDescriptors)
	const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors,0.6)
	document.body.append('Loaded');
	let image
	let canvas
	imageUpload.addEventListener('change', async ()=>{
		if (image) image.remove()
		if (canvas) canvas.remove()
		image = await faceapi.bufferToImage(imageUpload.files[0])
		// document.body.append(image)
		container.append(image)
		canvas = faceapi.createCanvasFromMedia(image)
		canvas.style.top = 0;
		canvas.style.left = 0;
		container.append(canvas)
		const displaySize = { width : image.width, height : image.height }
		console.log("displaySize=====",displaySize)
		faceapi.matchDimensions(canvas, displaySize)
		console.log("image  ====",image)
		const detections = await faceapi.detectAllFaces(image)
		.withFaceLandmarks().withFaceDescriptors()
		const resizeDetection = faceapi.resizeResults(detections, displaySize)
		const results = resizeDetection.map(d => faceMatcher.findBestMatch(d.descriptor))

		results.forEach((result, i) => {
			const box = resizeDetection[i].detection.box
			const drawBox = new faceapi.draw.DrawBox(box, {label : result.toString()})
			drawBox.draw(canvas)
		})
		// document.body.append(detections.length)
		// console.log("detections  ====",detections)
	})
}

function loadLabeledImage(){
	const labels = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']
	return Promise.all(
		labels.map(async label =>{
			const descriptors = []
			for (let i=1; i<=1;	i++){
				console.log("i",i,"                ==",`http://localhost:88/javascript-AI/face-recognization-rao-student/labeled_images/${label}/${i}.jpg`)
				const img = await faceapi.fetchImage(`http://localhost:88/javascript-AI/face-recognization-rao-student/labeled_images/${label}/${i}.jpg`)
				console.log("img-------------------->>>>>>>>>>",img)
				const detections = await faceapi.detectSingleFace(img)
				.withFaceLandmarks().withFaceDescriptor()			
				console.log("detections  ==",detections)	
				descriptors.push(detections.descriptor)
			}
		return new faceapi.LabeledFaceDescriptors(label, descriptors)	
		})
	)	
}

