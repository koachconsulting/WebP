// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener with better error handling
    const downloadButton = document.getElementById('downloadPng');
    if (!downloadButton) {
        console.error('Download PNG button not found!');
        return;
    }

    downloadButton.addEventListener('click', async () => {
        console.log('Download PNG button clicked');
        
        try {
            const svg = document.querySelector('.logo-svg');
            if (!svg) {
                alert('SVG logo not found!');
                console.error('SVG element with class .logo-svg not found');
                return;
            }
            
            console.log('SVG found:', svg);
            
            // Clone the SVG to avoid modifying the original
            const svgClone = svg.cloneNode(true);
            
            // Ensure SVG has proper dimensions
            const svgRect = svg.getBoundingClientRect();
            svgClone.setAttribute('width', svgRect.width);
            svgClone.setAttribute('height', svgRect.height);
            
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgClone);
            
            // Add XML namespace if missing
            if (!svgString.includes('xmlns')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            
            console.log('SVG string generated:', svgString.substring(0, 200) + '...');
            
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded successfully', img.width, 'x', img.height);
                
                const canvas = document.createElement('canvas');
                // Use actual SVG dimensions or fallback to reasonable size
                const width = Math.max(img.width, svgRect.width, 500);
                const height = Math.max(img.height, svgRect.height, 120);
                
                canvas.width = width * 2;  // 2x for high resolution
                canvas.height = height * 2;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the SVG image onto the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                console.log('Canvas drawing completed');
                
                // Convert canvas to PNG and download
                canvas.toBlob((blob) => {
                    if (!blob) {
                        alert('Failed to generate PNG image');
                        console.error('Failed to create blob from canvas');
                        return;
                    }
                    
                    console.log('Blob created, size:', blob.size);
                    
                    const downloadUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = 'koach-consulting-logo.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    console.log('Download initiated');
                    
                    // Clean up URLs
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                        URL.revokeObjectURL(downloadUrl);
                    }, 1000);
                }, 'image/png');
            };
            
            img.onerror = (error) => {
                console.error('Error loading SVG image:', error);
                alert('Error loading SVG for conversion. Check browser console for details.');
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
            
        } catch (error) {
            console.error('Error in PNG conversion:', error);
            alert('Error converting SVG to PNG: ' + error.message);
        }
    });
});
