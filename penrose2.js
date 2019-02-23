var Canvas = require('canvas')
  , fs = require('fs');

/*
Reference: http://preshing.com/20110831/penrose-tiling-explained/s
*/
var Tiling = (function () {

    var Vector = function(x, y){
        this.x = x;
        this.y = y;
    }
    var vadd = function (a, b){
        return new Vector(a.x+b.x, a.y+b.y);
    }
    var vsub = function (a, b){
        return new Vector(a.x-b.x, a.y-b.y);
    }    
    var vdiv = function (a, k){
        return new Vector(a.x/k, a.y/k);
    }
    
    var subdivide = function (triangles) {
        var GOLDENRATIO = (1.0 + Math.sqrt(5)) / 2.0;
        var result = [];
        for (var i = 0; i < triangles.length; i++) {        
            var t = triangles[i];
            var color = t[0], A = t[1], B = t[2], C = t[3]
            if (color === 0) {
                // Subdivide red triangle
                var P = vadd(C, vdiv(vsub(B, C), GOLDENRATIO));
                result.push([0, P, A, B], [1, C, P, A]);
            } else {
                // Subdivide blue triangle
                var Q = vadd(B, vdiv(vsub(A, B), GOLDENRATIO));
                var R = vadd(A, vdiv(vsub(C, A), GOLDENRATIO));
                result.push([1, B, C, R], [1, B, Q, R], [0, Q, R, A]);
            }
        }
        return result;
    } 

    var generateSeedSun = function(options){
        options = options || {};
        // Create wheel of red triangles around the origin
        var triangles = []
        for (var i = 0; i < 10; i++) {
            var A = new Vector(0, 0);
            var phi1 = (2.0*i - 1) * Math.PI / 10.0;
            var B = new Vector(Math.cos(phi1), Math.sin(phi1));
            phi2 = (2.0*i + 1) * Math.PI / 10.0;
            var C = new Vector(Math.cos(phi2), Math.sin(phi2));
            if (i % 2 === 0) {
                var temp = B;
                B = C;
                C = temp;
            }
            triangles.push([0, A, B, C]);
        }
        return triangles;
    }
    
    var generate = function(options) {
        options = options || {};
        depth = options.depth || 8;
        // Create a seed
        var triangles = generateSeedSun();
        // Perform subdivisions
        var numSubdivisions = depth;
        for (var i = 0; i < numSubdivisions; i++) {
            triangles = subdivide(triangles);        
        }
        return triangles;
    }
    
    var draw = function (ctx, size, triangles, drawStyle) {
        // fit drawing into canvas        
        var factorx = imageSize.x / 2.0;
        var factory = imageSize.y / 2.0;
        ctx.translate(factorx, factory);
        ctx.scale(factorx*1.2, factorx*1.2);
        // draw tiles
        ctx.strokeStyle = drawStyle.lineStyle;
        ctx.fillStyle = drawStyle.fillStyleA;
        ctx.lineWidth = drawStyle.lineWidth; 
        ctx.lineJoin = 'round';
        for (var i=0; i<triangles.length; i++) {
            var t = triangles[i];
            if (t[0] == 0) {
                ctx.beginPath();                
                ctx.moveTo(t[1].x, t[1].y);
                ctx.lineTo(t[2].x, t[2].y);
                ctx.lineTo(t[3].x, t[3].y);
                ctx.fill();
                //ctx.closePath();                
                ctx.stroke();
            }
        }      
        ctx.strokeStyle = drawStyle.lineStyle;
        ctx.fillStyle = drawStyle.fillStyleB;
        for (var i=0; i<triangles.length; i++) {
            var t = triangles[i];
            if (t[0] === 1) {
                ctx.beginPath();
                ctx.moveTo(t[1].x, t[1].y);                
                ctx.lineTo(t[2].x, t[2].y);
                ctx.lineTo(t[3].x, t[3].y);                
                ctx.fill();
                //ctx.closePath();
                ctx.stroke();
            }
        }
    }

  return {
    generate: generate,
    draw: draw,
  };

})();
var drawStyle = {
    'lineWidth' : 0.001,
    'lineStyle' : 'rgba(250,250,200,0.5)',
    'fillStyleA': 'rgba(150,0,0,0.5)',
    'fillStyleB': 'rgba(0,0,150,0.5)',
}

var drawStyle2 = {
    'lineWidth' : 0.001,
    'lineStyle' : 'rgba(150,150,150,0.5)',
    'fillStyleA': 'rgba(0,0,0,0.5)',
    'fillStyleB': 'rgba(0,0,0,0.5)',
}
var depth = 6;
var canvas = new Canvas(1070, 615, 'png');
var imageSize = {x:canvas.width, y:canvas.height};
var ctx = canvas.getContext('2d');
var tiles = Tiling.generate({depth: depth});
Tiling.draw(ctx, imageSize, tiles, drawStyle);
fs.writeFileSync('penrose2.png', canvas.toBuffer());
 
