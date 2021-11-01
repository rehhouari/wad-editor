/* If you are looking here then I assume you have some interest in understanding how to
 * manipulate the WAD3 format. If you are creating a free application for the benefit
 * of the community then feel free to sift through and copy any code that you like. 
 * If you have any questions, contact me at 
 * joefortune11 ((at)) gmail.com <---- See how I fooled the bots there!
 *
 * Good luck in your programming endeavors!
 *
 * -Joe */

import { createApp } from '/js/petite-vue.module.js'
import { dataURLtoFile, buildWad, displayImg, retrieveTexture, getWadHeader, getWadEntries, isValidWad,  ERRORS } from '/js/helpers.js'



createApp({
	uploaded: false,
	error: '',
	resetOnError: false,
	status: '',
	fileName: '',
	newFileName: 'new.wad',
	fileDataView: null,
	selected: 0, // currently selected texture
	renameInput: '',
	textures: [],
	search: '',
	interfaceDisabled: false,
	newWadBase64: `V0FEMwEAAACICAAAcGxhY2Vob2xkZXIAAAAAACAAAAAgAAAAKAAAACgEAAAoBQAAaAUAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAIAAAACAAICA
	AAAAgIAAgACAgICAgMDcwKbK8Co/qio//ypfACpfVSpfqipf/yp/ACp/VSp/qip//yqfACqfVSqf
	qiqf/yq/ACq/VSq/qiq//yrfACrfVSrfqirf/yr/ACr/VSr/qir//1UAAFUAVVUAqlUA/1UfAFUf
	VVUfqlUf/1U/AFU/VVU/qlU//1VfAFVfVVVfqlVf/1V/AFV/VVV/qlV//1WfAFWfVVWfqlWf/1W/
	AFW/VVW/qlW//1XfAFXfVVXfqlXf/1X/AFX/VVX/qlX//38AAH8AVX8Aqn8A/38fAH8fVX8fqn8f
	/38/AH8/VX8/qn8//39fAH9fVX9fqn9f/39/AH9/VX9/qn9//3+fAH+fVX+fqn+f/3+/AH+/VX+/
	qn+//3/fAH/fVX/fqn/f/3//AH//VX//qn///6oAAKoAVaoAqqoA/6ofAKofVaofqqof/6o/AKo/
	Vao/qqo//6pfAKpfVapfqqpf/6p/AKp/Vap/qqp//6qfAKqfVaqfqqqf/6q/AKq/Vaq/qqq//6rf
	AKrfVarfqqrf/6r/AKr/Var/qqr//9QAANQAVdQAqtQA/9QfANQfVdQfqtQf/9Q/ANQ/VdQ/qtQ/
	/9RfANRfVdRfqtRf/9R/ANR/VdR/qtR//9SfANSfVdSfqtSf/9S/ANS/VdS/qtS//9TfANTfVdTf
	qtTf/9T/ANT/VdT/qtT///8AVf8Aqv8fAP8fVf8fqv8f//8/AP8/Vf8/qv8///9fAP9fVf9fqv9f
	//9/AP9/Vf9/qv9///+fAP+fVf+fqv+f//+/AP+/Vf+/qv+////fAP/fVf/fqv/f////Vf//qszM
	///M/zP//2b//5n//8z//wB/AAB/VQB/qgB//wCfAACfVQCfqgCf/wC/AAC/VQC/qgC//wDfAADf
	VQDfqgDf/wD/VQD/qioAACoAVSoAqioA/yofACofVSofqiof/yo/ACo/Vf/78KCgpICAgP8AAAD/
	AP//AAAA//8A/wD//////wAADAAAAHwIAAB8CAAAQwAAAHBsYWNlaG9sZGVyAAAAAAA=`,
	onUpload(event) {
		if (!event.srcElement.files.length) return
			let file = event.srcElement.files[0]
		this.create(file)
	},

	
	createEmpty() {
		let file = dataURLtoFile(`data:text/plain;base64,${this.newWadBase64.replace(' ', '')}`, this.newFileName);
		this.create(file)
	},

	create(file) {
		this.fileName = file.name
		// Create a FileReader to read file
		let reader = new FileReader()
		// Set up callback function so when the FilReader is finished, it passes the ArrayBuffer
		// to the parseWad function
		reader.onload = function () {
			// Create DataView to view the buffer by types
			this.fileDataView = new DataView(reader.result)
			if (!isValidWad(this.fileDataView)) {
				this.throwError(ERRORS.INVALID, true)
				return
			} else {
				this.parseWad()
				this.uploaded = true
			}
		}.bind(this)
		// Start converting file to ArrayBuffer
		reader.readAsArrayBuffer(file)
	},
	
	showStatus(status) {
		this.status = status
	},

	getEntries() {
		return this.textures.filter((v) =>
			v.name
			.toLowerCase()
			.includes(this.search.toLowerCase().replace(' ', '').trim())
			)
	},
	
	displayTexture(canvas) {
		let ctx = canvas.getContext('2d')
		if (!this.textures.length) {
			ctx.clearRect(0, 0, canvas.width, canvas.height)			
			return
		}
		if (canvas.classList.contains('hidden'))
			canvas.classList.remove('hidden')

		let texture = this.textures[this.selected]

		// Resize canvas to image
		canvas.height = texture.height
		canvas.width = texture.width

		// Get access to the canvas pixel buffer
		let imgData = ctx.createImageData(texture.width, texture.height)

		// Clear screen
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// Draw pixels to pixel buffer
		let nPixels = texture.width * texture.height
		let imgDataIndex = 0
		for (let i = 0; i < nPixels; i++) {
			let palIndex = texture.mipLevel[0][i]
			imgData.data[imgDataIndex + 0] = texture.palette[palIndex].r // Red
			imgData.data[imgDataIndex + 1] = texture.palette[palIndex].g // Green
			imgData.data[imgDataIndex + 2] = texture.palette[palIndex].b // Blue
			imgData.data[imgDataIndex + 3] = 255 // Alpha
			imgDataIndex += 4
		}

		// Send pixel buffer back to canvas
		ctx.putImageData(imgData, 0, 0)
	},

	throwError(error, reset = false) {
		this.resetOnError = reset
		this.error = error
	},

	clearError() {
		this.error = ''
		if (this.resetOnError)
			this.reset()
	},

	reset() {
		this.uploaded = false
		this.fileDataView = null
		this.fileName = ''
		this.newFileName = 'new.wad'
		this.textures = []
	},

	rename() {
		this.textures[this.selected].name = this.renameInput
		this.showStatus('Texture Renamed')
	},

	remove() {
		// Remove from texture array without leaving gap
		this.textures.splice(this.selected, 1)
		if (this.textures.length <= this.selected && this.textures.length)
			this.selected -= 1
		this.showStatus('Texture Removed')
		if (!this.textures.length) {
			viewport.classList.add('hidden')
		}
	},

	parseWad() {
		// Get the WAD header
		let header = getWadHeader(this.fileDataView)

		// Get the WAD Directory Entries (List of texture file details)
		let entries = getWadEntries(
			this.fileDataView,
			header.dirOffset,
			header.nEntries
		) // Global

		// Create the texture objects
		for (let i = 0; i < entries.length; i++) {
			this.textures[i] = retrieveTexture(
				this.fileDataView,
				entries[i]
				)
		}
	},

	saveZip() {
		this.interfaceDisabled = true
		let zip = new window.JSZip()
		// create a folder with the name of the file to prevent a mess on "extract here"
		let img = zip.folder(this.fileName.toLowerCase().replace('.wad', ''))
		let canvas = document.getElementById('viewport')
		let previousSelection = this.selected
		for (let i = 0; i < this.textures.length; i++) {
			// display each texture to get it's data URL
			this.selected = i
			this.displayTexture(canvas)
			// convert the dataURL to base64 and save it to a file
			img.file(
				`${this.textures[i].name}.png`,
				canvas
				.toDataURL()
				.replace(/^data:image\/(png|jpg);base64,/, ''),
				{ base64: true }
				)
		}
		this.selected = previousSelection
		zip.generateAsync({ type: 'blob' }).then(
			function (content) {
				// see FileSaver.js
				window.saveAs(content, `${this.fileName}.zip`)
			}.bind(this)
			)
		this.interfaceDisabled = false
	},

	saveWad() {
		this.interfaceDisabled = true
		let buffer = buildWad(this.textures)
		if (!buffer) return
			let a = document.createElement('a')
		document.body.appendChild(a)
		a.hidden = true
		let blob = new Blob([buffer], { type: 'octet/stream' })
		let url = window.URL.createObjectURL(blob)
		a.href = url
		a.download = this.fileName
		a.click()
		window.URL.revokeObjectURL(url)
		a.remove()
		this.interfaceDisabled = false
	},

	addTexture(event) {
		if (!event.srcElement.files.length)
			return
		
		let imgFile = event.srcElement.files[0]

		// Create a FileReader and onload handler
		let reader = new FileReader()
		reader.onload = function (event) {
			// Create image and onload handler
			let img = new Image()
			img.onload = function () {
				this.showStatus('Starting')
				// Make sure img dimensions are multiples of 16
				if (img.width % 16 || img.height % 16) {
					this.throwError(ERRORS.DIMENSTIONS)
					return
				}

				this.interfaceDisabled = true

				// Set-up canvas
				let canvas = document.getElementById('viewport')
				let ctx = canvas.getContext('2d')
				canvas.width = img.width
				canvas.height = img.height

				// Draw image to canvas
				ctx.drawImage(img, 0, 0)

				// Get the pixel buffer from the canvas
				let buffer = ctx.getImageData(
					0,
					0,
					canvas.width,
					canvas.height
					).data

				// Create web worker to handle the intense image processing routines
				let textureWorker = new Worker('/js/create_texture.js')

				// Worker output letiable
				let texture

				// Message handler for textureWorker
				textureWorker.onmessage = function (event) {
					// Is incoming message a status update?
					if (event.data.type == 'status') {
						this.showStatus(event.data.msg)
					}
					// Otherwise its the processed texture
					else {
						texture = event.data.texture
						// Display the image from palette form
						displayImg(texture.mipLevel[0], texture.palette)

						// Add the texture (handles document stuff)
						// TODO ----------------- Generate mip textures
						this.textures.push(texture)
						this.interfaceDisabled = false
					}
				}.bind(this)

				let fileName = imgFile.name
				let extensionStart = fileName.lastIndexOf('.')
				if (extensionStart) {
					fileName = fileName.slice(0, extensionStart)
				}

				// Start textureWorker thread
				textureWorker.postMessage({
					height: img.height,
					width: img.width,
					name: fileName,
					buffer: buffer,
				})
			}.bind(this)
			img.src = event.target.result
		}.bind(this)
		// Invoke FileReader with the image file
		reader.readAsDataURL(imgFile)
	},
}).mount('#app')

