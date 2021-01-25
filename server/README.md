# Rohak Phase 2
##node-canvas
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

##Fill PDF
sudo apt-get install libpoppler-qt5-dev libcairo2-dev
sudo apt-get install imagemagick ghostscript poppler-utils

to convert image to pdf via `convert` utility
/etc/ImageMagick-6/policy.xml
<!-- <policy domain="coder" rights="none" pattern="PDF" /> -->
to
<!-- <policy domain="coder" rights="read|write" pattern="PDF" /> -->
