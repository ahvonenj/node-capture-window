import { K, U } from 'win32-api'

const knl32 = K.load()
const user32 = U.load()

export function getRawWindowRect(windowTitle)
{
	const pointerToRect = function (rectPointer) 
	{
		const rect = {};
		rect.left = rectPointer.readInt16LE(0);
		rect.top = rectPointer.readInt16LE(4);
		rect.right = rectPointer.readInt16LE(8);
		rect.bottom = rectPointer.readInt16LE(12);
		return rect;
	}

	const lpszWindow = Buffer.from(windowTitle, 'ucs2')
	const hWnd = user32.FindWindowExW(0, 0, null, lpszWindow)
	 
	if (typeof hWnd === 'number' && hWnd > 0
	  || typeof hWnd === 'bigint' && hWnd > 0
	  || typeof hWnd === 'string' && hWnd.length > 0
	)
	{
		const rectPointer = Buffer.alloc(16);
		const res = user32.GetWindowRect(hWnd, rectPointer)

		return pointerToRect(rectPointer);
	}
	else
	{
		return null;
	}
}

/*
	This is for trying to calculate window rect, when there are multiple monitors (with different resolutions)
*/
export function getWindowRect(windowTitle, monitors)
{
	let rawRect = getRawWindowRect(windowTitle);

	// Window not found, returns null
	if(rawRect === null)
		return null;

	// Window is minimized, return -1
	if(rawRect.left <= -30000 || rawRect.top <= -30000)
		return -1;

	// Only one monitor, the rawRect dimensions should be fine
	if(Object.keys(monitors).length === 1)
		return rawRect;

	let xResolutions = new Array(Object.keys(monitors).length);
	let yResolutions = new Array(Object.keys(monitors).length);

	let i = 0;

	for(let key in monitors)
	{
		if(!monitors.hasOwnProperty(key))
			continue;

		let monitor = monitors[key];
		let resolution = monitor.resolution;

		xResolutions[i] = resolution[0];
		yResolutions[i] = resolution[1];

		i++;
	}

	let xSame = xResolutions.every(r => r === xResolutions[0]);
	let ySame = yResolutions.every(r => r === yResolutions[0]);
	let xMax = Math.max(...xResolutions);
	let yMax = Math.max(...yResolutions);

	// For some reason, probably because of windows window shadows, there's a 7 pixel error with x-values
	const xPixelCorrectionOffset = 7;

	// Window is on the left monitor
	if(rawRect.left < -xPixelCorrectionOffset)
	{
		// Without the offset, the zero of window y-position is calculated from the highest resolution monitor y-position
		// Here we just subtract the difference of the y-resolutions
		let yOffset = 0;

		if(monitors.monitor0.resolution[1] < yMax)
			yOffset = yMax - monitors.monitor0.resolution[1];

		// As x-coordinates are based on the middle monitor, we rebase the x-coordinates by adding the left monitor width
		rawRect.left += monitors.monitor0.resolution[0] + xPixelCorrectionOffset;
		rawRect.right += monitors.monitor0.resolution[0] - xPixelCorrectionOffset;
		rawRect.top -= yOffset;
		rawRect.bottom -= yOffset;
	}
	// Window is on the middle monitor
	else if(rawRect.left >= -xPixelCorrectionOffset && rawRect.left < monitors.monitor1.resolution[0] - xPixelCorrectionOffset)
	{
		rawRect.left += xPixelCorrectionOffset;
		rawRect.right -= xPixelCorrectionOffset;
	}
	// Window is on the right monitor
	else
	{
		// Without the offset, the zero of window y-position is calculated from the highest resolution monitor y-position
		// Here we just subtract the difference of the y-resolutions
		let yOffset = 0;

		if(monitors.monitor2.resolution[1] < yMax)
			yOffset = yMax - monitors.monitor2.resolution[1];

		// As x-coordinates are based on the middle monitor, we rebase the x-coordinates by subtracting the middle monitor width
		rawRect.left += -monitors.monitor1.resolution[0] + xPixelCorrectionOffset;
		rawRect.right += -monitors.monitor1.resolution[0] - xPixelCorrectionOffset;
		rawRect.top -= yOffset;
		rawRect.bottom -= yOffset;
	}

	return rawRect;
}