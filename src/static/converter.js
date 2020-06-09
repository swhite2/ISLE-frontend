function convert() {
    var canvas = document.getElementById('fluidSim');
    var ctx = canvas.getContext("webgl2");
    var pixels = new Int32Array(ctx.drawingBufferWidth * ctx.drawingBufferHeight * 4);
    ctx.readPixels(0, 0, ctx.drawingBufferWidth, ctx.drawingBufferHeight, ctx.RGB_INTEGER, ctx.INT, pixels);
    return pixels;
    //console.log(pixels);
}