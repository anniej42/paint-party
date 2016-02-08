var canvas, stage, carve;
var ctx, ctxcarve;
var side;
var drawingCanvas;
var oldPt;
var oldMidPt;
var title;
var color;
var stroke;
var index;
var jsonColors = [];
var savecircle = null;
var IMG_DATA = null;

var carveCanvas = null;

function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext('2d');

    carve = document.getElementById('carveout');
    ctxcarve = carve.getContext("2d");

    var w = window.innerWidth || e.clientWidth || g.clientWidth;
    var h = window.innerHeight || e.clientHeight || g.clientHeight;
    side = Math.min(w, h);

    // $("#myCanvas")[0].attr("width", width).attr("height", height);

    ctx.canvas.height = side;
    ctx.canvas.width = side;

    index = 0;
    colors = ["#B03060", "#FE9A76", "#FFD700", "#32CD32", "#016936", "#008080", "#0E6EB8", "#EE82EE", "#B413EC", "#FF1493", "#A52A2A", "#A0A0A0", "#f2f2f2", "#000000"];

    color = colors[0];

    //check to see if we are running in a browser with touch support
    stage = new createjs.Stage(canvas);
    stage.autoClear = false;
    stage.enableDOMEvents(true);

    createjs.Touch.enable(stage);
    createjs.Ticker.setFPS(24);

    drawingCanvas = new createjs.Shape();

    stage.addEventListener("stagemousedown", handleMouseDown);
    stage.addEventListener("stagemouseup", handleMouseUp);
    stage.addChild(drawingCanvas);
    stage.update();

    make_carve("carve0.png");
    make_palette();
    make_bgPicker().done(function() {
        $("#blank").css("height", document.getElementById('img0').getBoundingClientRect().height)
    })

    $("#save").on("click", save_img)
    $("#blank").on("click", function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxcarve.clearRect(0, 0, carve.width, carve.height);
    })

    $('img').on('click', function(event) {
        var src = $(this).attr('src');
        make_carve(src);
    });

}

function handleMouseDown(event) {
    if (!event.primary) {
        return;
    }
    if (stage.contains(title)) {
        stage.clear();
        stage.removeChild(title);
    }

    stroke = 40;
    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    oldMidPt = oldPt.clone();
    stage.addEventListener("stagemousemove", handleMouseMove);
}

function handleMouseMove(event) {
    if (!event.primary) {
        return;
    }
    var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);
    drawingCanvas.graphics.clear()
        .setStrokeStyle(stroke, 'round', 'round')
        .beginStroke(color).moveTo(midPt.x, midPt.y)
        .curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

    oldPt.x = stage.mouseX;
    oldPt.y = stage.mouseY;
    oldMidPt.x = midPt.x;
    oldMidPt.y = midPt.y;

    stage.update();
}

function handleMouseUp(event) {
    if (!event.primary) {
        return;
    }
    stage.removeEventListener("stagemousemove", handleMouseMove);
}

function make_palette() {
    for (var i = 0; i < colors.length; i++) {
        jsonColors.push({
            "i": i,
            "color": colors[i]
        })
    }
    var svgContainer = d3.select("body").append("svg")
        .attr("width", 200)
        .attr("height", 400)
        .attr("id", "palette");

    var circles = svgContainer.selectAll("circle")
        .data(jsonColors)
        .enter()
        .append("circle");

    var circleAttributes = circles
        .attr("cx", function(d) {
            return d.i % 2 * 45 + 40
        })
        .attr("cy", function(d) {
            return ~~(d.i / 2) * 45 + 40
        })
        .attr("r", function(d) {
            return 18
        })
        .style("fill", function(d) {
            return d.color;
        })
        .filter(function(d) {
            return d.i == 0
        })
        .style("stroke", "#0d0d0d").style("stroke-width", 4)

    circles.filter(function(d) {
            return d.color == "#f2f2f2"
        })
        .style("stroke", "#0d0d0d").style("stroke-width", 4)

    circles.on('click', function(d) {
        color = d.color;
        circles.transition().attr("r", 18).filter(function(d) {
            return d.color != "#f2f2f2"
        }).style("stroke", "none");
        d3.select(this).transition().attr("r", 23)
            .transition().attr("r", 18)
            .style("stroke", "#0d0d0d")
            .style("stroke-width", 4);
    });

    var savebutton = svgContainer.append("g").attr("id", "save");

    savecircle = savebutton.append("circle")
        .attr("cx", function(d) {
            return colors.length % 2 * 45 + 40
        })
        .attr("cy", function(d) {
            return ~~(colors.length / 2) * 45 + 40
        })
        .attr("r", function(d) {
            return 18
        })
        .style("fill", "none")
        .style("stroke", "#0d0d0d")
        .style("stroke-width", 4);

    savebutton.append("text").attr('font-family', 'FontAwesome')
        .attr("x", colors.length % 2 * 45 + 40)
        .attr("y", ~~(colors.length / 2) * 45 + 40)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '20px')
        .text(function(d) {
            return '\uf063'
        });
}

function make_carve(src) {
    // var d = $.Deferred();
    base_image = new Image();
    carve.width = carve.height = side;

    base_image.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxcarve.clearRect(0, 0, carve.width, carve.height);
        ctxcarve.drawImage(base_image, 0, 0, side, side);
        ctxcarve.fill();
    }
    base_image.src = src;

    // setTimeout(function() {
    //     d.resolve();
    // }, 500);
    // return d;
}

function make_bgPicker() {
    var d = $.Deferred();
    var n = 3;
    var src;
    for (var i = 0; i < n; i++) {
        src = "carve" + i + ".png";
        $("#bgPicker").append("<img id='img" + i + "' src='" + src + "'></img>")
    }
    setTimeout(function() {
        d.resolve();
    }, 500);
    return d;
}

function save_img() {
    ctx.drawImage(carve, 0, 0);
    ctx.fill();

    canvas.toBlob(function(blob) {
        saveAs(blob, "natie painted.png");
    });
}
