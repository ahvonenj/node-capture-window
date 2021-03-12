import { K, U } from 'win32-api'

const knl32 = K.load()
const user32 = U.load()

function getWindowRect(windowTitle)
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

let rect = getWindowRect('Untitled - Notepad\0');
console.log(rect)
