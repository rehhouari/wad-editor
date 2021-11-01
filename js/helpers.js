export const ERRORS = {
	INVALID: 'Invalid WAD3 file',
	DIMENSTIONS: 'Image dimensions must be multiples of 16.',
}

/********************************************************
 * isValidWad
 *
 * Takes a DataView object of the WAD file and checks for
 * the magic string "WAD3". Returns true if valid, false
 * if not.
 ********************************************************/
 export function isValidWad(fileDataView) {
	// Read magic string and make sure this is a valid WAD3 File
	return !(
		fileDataView.getUint8(0) != 0x57 ||
		fileDataView.getUint8(1) != 0x41 ||
		fileDataView.getUint8(2) != 0x44 ||
		fileDataView.getUint8(3) != 0x33
	) // "WAD3"
}

/********************************************************
 * getWadHeader
 *
 * Takes a DataView object of the WAD file and parses the
 * WAD header into an object.
 *
 *Header Specification (12 bytes)
 *  4   Magic Number  "WAD3"
 *  4   nDir          (The number of directory entries)
 *  4   nDirOffset    Offset into file where entries start
 ********************************************************/
 export function getWadHeader(dv) {
 	let header = {}

	// Get the number of entries
	header.nEntries = dv.getUint32(4, true)

	// Get directory offset (directory contains all the file entries)
	header.dirOffset = dv.getUint32(8, true)

	return header
}

/********************************************************
 * getWadEntries
 *
 * Takes a DataView object of the WAD file and parses the
 * collection of WAD entries into an array of objects.
 *
 * Directory Entry Specification (32 bytes)
 *  4   nFilePos      Absolute offset to file's location
 *  4   nDiskSize     Size of the file
 *  4   nSize         Uncompressed size
 *  1   nType         Type of entry
 *  1   bCompression  0 if not compressed
 *  2   nDUmmy        Unused
 *  16  szName        Name of file (null terminated)
 ********************************************************/
 export function getWadEntries(dv, dirOffset, nEntries) {
 	let entrySize = 32
 	let entries = []

 	for (let i = 0; i < nEntries; i++) {
		// Object to hold entry
		let currEntry = {}

		// Offset to start of current entry
		let entryPos = dirOffset + i * entrySize

		// Offset property
		currEntry.offset = dv.getUint32(entryPos, true)

		// Size property
		currEntry.size = dv.getUint32(entryPos + 4, true)

		// Uncompressed Size property
		currEntry.uSize = dv.getUint32(entryPos + 8, true)

		// Type property
		currEntry.type = dv.getUint8(entryPos + 12)

		// Compressed State property
		currEntry.isCompressed = dv.getUint8(entryPos + 13)

		// Name String property
		currEntry.name = dataViewToString(dv, entryPos + 16, 16)

		// Add entry to entries array
		entries.push(currEntry)
	}

	return entries
}

/********************************************************
 * retrieveTexture
 *
 * Takes a DataView object of the WAD file, and the
 * the texture's directory entry object and creates
 * a texture object.
 *
 * Texture File Specification (file header is 40 bytes)
 *  16  szName    Name of texture file (null terminated)
 *  4   nWidth    Width of texture in pixels
 *  4   nHeight   Height of texture in pixels
 *  4   offset0   relative Offset to level 0 MIP texture
 *  4   offset1   relative Offset to level 1 MIP texture
 *  4   offset2   relative Offset to level 2 MIP texture
 *  4   offset3   relative offset to level 3 MIP texture
 *---OFFSETS ARE RELATIVE TO BEGINNING OF FILE HEADER)---
 *  let tex0      MIP texture level 0
 *  let tex1      MIP texture level 1
 *  let tex2      MIP texture level 2
 *  let tex3      MIP texture level 3
 *  2   nColors   Number of colors in palette (Max 256)
 *  768 palette   Color table, 256 triplets of (R, G, B)
 *  2   padding
 ********************************************************/
 export function retrieveTexture(dv, dirEntry) {
 	let texture = {}
	let offset = dirEntry.offset // Offset of actual texture within file

	// Name
	texture.name = dataViewToString(dv, offset, 16)

	// Width/Height
	texture.width = dv.getUint32(offset + 16, true)
	texture.height = dv.getUint32(offset + 20, true)

	// MIP Texture Offsets by level
	let mipOffset = []
	mipOffset[0] = dv.getUint32(offset + 24, true)
	mipOffset[1] = dv.getUint32(offset + 28, true)
	mipOffset[2] = dv.getUint32(offset + 32, true)
	mipOffset[3] = dv.getUint32(offset + 36, true)

	// Read in MIP Textures by level
	texture.mipLevel = []
	for (let level = 0; level < 4; level++) {
		texture.mipLevel[level] = []

		// Read the pixels (Note, these are not RGB values, they are references to the palette)
		// The texture dimensions are divided by a power of 4 for each additional MIP level /4 /16 /64
		let nPixels = (texture.width * texture.height) / Math.pow(4, level)
		for (let i = 0; i < nPixels; i++) {
			texture.mipLevel[level][i] = dv.getUint8(
				offset + mipOffset[level] + i,
				true
				)
		}
	}

	// Read in palette
	texture.palette = []

	// Palette is at the end of the file. We find the palette by starting at the file offset, fast-forward
	// to end of file, then back off by the size of the palette 768 (256 * 3)
	let paletteOffset = offset + dirEntry.size - 768 - 2
	for (let i = 0; i < 768; i += 3) {
		let r = dv.getUint8(paletteOffset + i, true)
		let g = dv.getUint8(paletteOffset + i + 1, true)
		let b = dv.getUint8(paletteOffset + i + 2, true)

		// Add the RGB object to the palette array
		texture.palette.push({ r: r, g: g, b: b })
	}
	return texture
}

/********************************************************
 * dataViewToString
 *
 * Takes a DataView object of the WAD file, a starting
 * offset, and a maximum length and converts that portion
 * of the dataView to a string.
 ********************************************************/
 function dataViewToString(dv, start, len) {
 	let str = ''
 	for (let i = 0; i < len; i++) {
		// Get the ASCII code
		let charCode = dv.getUint8(start + i)

		// End loop if NULL-terminator
		if (charCode == 0)
			break

		// Add character to name string
		str += String.fromCharCode(charCode)
	}
	return str
}

/********************************************************
 * buildWad()
 *
 * Builds a binary WAD file using textures stored in the
 * global "textures" array letiable and then initiates
 * the download.
 ********************************************************/
 export function buildWad(textures) {
	// Keep track of file offsets for later when we build directory entries
	let fileOffsets = []

	// Keep track of the individual file lengths for later when we build directory entries
	let fileSizes = []

	// Header size
	let headerSize = 12

	// Calculate the size of the directory entries section
	let entriesSize = textures.length * 32

	// Calculate size of the file/data section
	let fileSectionSize = 0
	for (let i = 0; i < textures.length; i++) {
		let nPixels = textures[i].width * textures[i].height
		fileSectionSize +=
		40 +
		nPixels +
		nPixels / 4 +
		nPixels / 16 +
		nPixels / 64 +
		2 +
		768 +
		2
	}

	// Create a buffer to hold our file
	let buffer = new ArrayBuffer(headerSize + entriesSize + fileSectionSize)

	// Create a dataview so we can populate the buffer with specific data types
	let dv = new DataView(buffer)

	// File position
	let pos = 0

	// Build header
	pos = putByte(dv, pos, 0x57) // W
	pos = putByte(dv, pos, 0x41) // A
	pos = putByte(dv, pos, 0x44) // D
	pos = putByte(dv, pos, 0x33) // 3
	pos = put32(dv, pos, textures.length) // nDirs
	pos = put32(dv, pos, headerSize + fileSectionSize) // nDirOffset (entries start after file/data section)

	// Build File/Data section
	for (let i = 0; i < textures.length; i++) {
		fileOffsets.push(pos) // Note the current file position (used in directory entry later)

		pos = putStr16(dv, pos, textures[i].name) // Name string
		pos = put32(dv, pos, textures[i].width) // Width
		pos = put32(dv, pos, textures[i].height) // Height

		// Calculate MIP texture offsets
		let nPixels = textures[i].height * textures[i].width
		let mipOffset0 = 40
		let mipOffset1 = mipOffset0 + nPixels
		let mipOffset2 = mipOffset1 + nPixels / 4
		let mipOffset3 = mipOffset2 + nPixels / 16

		// Write the MIP offsets
		pos = put32(dv, pos, mipOffset0) // MIP Level 0 offset
		pos = put32(dv, pos, mipOffset1) // MIP Level 1 offset
		pos = put32(dv, pos, mipOffset2) // MIP Level 2 offset
		pos = put32(dv, pos, mipOffset3) // MIP Level 3 offset

		// Write the MIP texture data by level
		for (let level = 0; level < 4; level++) {
			// Write all pixels within that layer
			let currLevel = textures[i].mipLevel[level]
			let currLength = currLevel.length
			for (let pixel = 0; pixel < currLength; pixel++) {
				// Write pixel
				pos = putByte(dv, pos, currLevel[pixel])
			}
		}

		// Write the palette
		pos = put16(dv, pos, 256) // Number of colors used
		let palette = textures[i].palette
		for (let palIndex = 0; palIndex < 256; palIndex++) {
			if (!palette[palIndex]) continue
			// Write palette entry
			pos = putByte(dv, pos, palette[palIndex].r) // Red
			pos = putByte(dv, pos, palette[palIndex].g) // Green
			pos = putByte(dv, pos, palette[palIndex].b) // Blue
		}

		// 2 bytes of padding following palette
		pos = put16(dv, pos, 0)

		// Record the file size (current position - starting position)
		fileSizes[i] = pos - fileOffsets[i]
	}

	// Now build the directory entries
	for (let i = 0; i < textures.length; i++) {
		pos = put32(dv, pos, fileOffsets[i]) // offset of file in WAD
		pos = put32(dv, pos, fileSizes[i]) // file size
		pos = put32(dv, pos, fileSizes[i]) // uncompressed size (same, we don't support compression)
		pos = putByte(dv, pos, 67) // type (67 is what Wally uses, so it must be a good choice)
		pos = putByte(dv, pos, 0) // compression (0 because we don't support it)
		pos = put16(dv, pos, 0) // 2 dummy bytes
		pos = putStr16(dv, pos, textures[i].name) // texture name (16 bytes, null terminated)
	}

	return buffer
}

/********************************************************
 * binary putexport functions
 *
 * Takes a dataview object, a position (in bytes), and
 * a letiable to write.
 ********************************************************/
 function putByte(dv, pos, data) {
 	dv.setUint8(pos, data)
 	return pos + 1
 }

 function put16(dv, pos, data) {
 	dv.setUint16(pos, data, true)
 	return (pos += 2)
 }

 function put32(dv, pos, data) {
 	dv.setUint32(pos, data, true)
 	return (pos += 4)
 }

 function putStr16(dv, pos, str) {
 	if (str.length > 15) {
 		console.error(
 			'putStr16: Attempted to use string greater than length 15'
 			)
 		return null
 	}

	let charLoop = str.length // How many characters to add
	let nullLoop = 16 - str.length // How many null terminators to add

	// Loop to add the string characters
	for (let i = 0; i < charLoop; i++) {
		let charCode = str.charCodeAt(i)
		dv.setUint8(pos + i, charCode)
	}

	// Loop to fill the any remaining bytes within the 16 length with null terminators
	for (let i = 0; i < nullLoop; i++) {
		dv.setUint8(pos + charLoop + i, 0)
	}

	return (pos += 16)
}

/********************************************************
 * displayImg()
 *
 * Takes an array of pixels (which are not RGB values, but
 * references into the palette), and the palette itself
 * and displays the image in the viewport canvas.
 ********************************************************/
 export function displayImg(refs, palette) {
	// Get image data to swap out
	let canvas = document.getElementById('viewport')
	let ctx = canvas.getContext('2d')
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
	let buffer = imgData.data

	// For all the palette references in the buffer
	let pixelIndex = 0
	for (let i = 0; i < refs.length; i++) {
		// Grab color from palette
		let color = palette[refs[i]]

		// Build the pixel in the pixel buffer
		buffer[pixelIndex++] = color.r
		buffer[pixelIndex++] = color.g
		buffer[pixelIndex++] = color.b
		buffer[pixelIndex++] = 255
	}

	// Reinsert image data to canvas
	ctx.putImageData(imgData, 0, 0)
}

export function dataURLtoFile(dataurl, filename) {

	var arr = dataurl.split(','),
	mime = arr[0].match(/:(.*?);/)[1],
	bstr = atob(arr[1]), 
	n = bstr.length, 
	u8arr = new Uint8Array(n);

	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	
	return new File([u8arr], filename, {type:mime});
}
