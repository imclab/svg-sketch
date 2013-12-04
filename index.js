(function () {
    "use strict";

    var svg = document.getElementById("svg"),
        elements = document.getElementById("elements"),
        toolbar = document.getElementById("toolbar"),
        do_nothing = function (e) {
            e.preventDefault();
            return false;
        },
        modes = {
            select:  {
                is_moving:           false,
                move_start_position: null,
                element:             null,
                mousemove:           function (e) {
                    if (this.is_moving) {
                        var tx = e.offsetX - this.move_start_position.x,
                            ty = e.offsetY - this.move_start_position.y;
                        this.element.setAttribute("transform", "translate(" + tx + "," + ty + ")");
                    }
                    else {
                        var target = e.target,
                            target_is_element = target.nodeName !== "svg";
                        if (!this.element && target_is_element) {
                            this.element = target;
                            this.element.setAttribute("class", "element_selected");
                        }
                        if (this.element && (!target_is_element || target !== this.element)) {
                            this.element.setAttribute("class", "");
                            this.element = null;
                        }
                    }
                },
                mousedown:           function (e) {
                    if (this.element) {
                        this.is_moving = true;
                        var transform = this.element.getAttribute("transform");
                        if (transform) {
                            transform = transform.replace("translate(", "").replace(")", "").split(",");
                            this.move_start_position = {x: e.offsetX - Number(transform[0]), y: e.offsetY - Number(transform[1])};
                        }
                        else {
                            this.move_start_position = {x: e.offsetX, y: e.offsetY};
                        }
                    }
                },
                mouseup:             function () {
                    if (this.is_moving) {
                        this.is_moving = false;
                        this.move_start_position = null;
                    }
                },
                contextmenu:         do_nothing
            },
            pen:     {
                is_drawing:  false,
                element:     null,
                element_d:   "",
                mousedown:   function (e) {
                    this.is_drawing = true;
                    this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    elements.appendChild(this.element);
                    this.element_d = " M " + e.offsetX + ", " + e.offsetY;
                    this.element.setAttribute("d", this.element_d);
                },
                mousemove:   function (e) {
                    if (!this.is_drawing) {
                        return;
                    }
                    this.element_d += " L " + e.offsetX + ", " + e.offsetY;
                    this.element.setAttribute("d", this.element_d);
                },
                mouseup:     function () {
                    if (!this.is_drawing) {
                        return;
                    }
                    this.is_drawing = false;
                    this.element = null;
                    this.element_d = "";
                },
                contextmenu: do_nothing
            },
            line_to: {
                is_drawing:  false,
                element:     null,
                mousedown:   function (e) {
                    this.is_drawing = true;
                    this.element = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    this.element.setAttribute("x1", e.offsetX);
                    this.element.setAttribute("y1", e.offsetY);
                    this.element.setAttribute("x2", e.offsetX);
                    this.element.setAttribute("y2", e.offsetY);
                    elements.appendChild(this.element);
                },
                mousemove:   function (e) {
                    if (!this.is_drawing) {
                        return;
                    }
                    this.element.setAttribute("x2", e.offsetX);
                    this.element.setAttribute("y2", e.offsetY);
                },
                mouseup:     function (e) {
                    if (!this.is_drawing) {
                        return;
                    }
                    this.is_drawing = false;
                    this.element = null;
                },
                contextmenu: do_nothing
            },
            rect:    {
                is_drawing:     false,
                element:        null,
                element_origin: "",
                mousedown:      function (e) {
                    this.is_drawing = true;
                    this.element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                    this.element_origin = e.offsetX + "," + e.offsetY;
                    this.element.setAttribute("points", this.element_origin);
                    elements.appendChild(this.element);
                },
                mousemove:      function (e) {
                    if (!this.is_drawing) {
                        return;
                    }
                    var origin = this.element_origin.split(","),
                        points = this.element_origin +
                            " " + (e.offsetX) + "," + origin[1] +
                            " " + e.offsetX + "," + e.offsetY +
                            " " + origin[0] + "," + e.offsetY;
                    this.element.setAttribute("points", points);
                },
                mouseup:        function (e) {
                    if (!this.is_drawing) {
                        return;
                    }
                    this.is_drawing = false;
                    this.element = null;
                    this.element_origin = "";
                },
                contextmenu:    do_nothing
            }
        };

    svg.addEventListener("mousedown", trigger_event);
    svg.addEventListener("mousemove", trigger_event);
    svg.addEventListener("mouseup", trigger_event);
    svg.addEventListener("contextmenu", trigger_event);

    function trigger_event(e) {
        var event = e.type,
            mode = toolbar.mode.value;
        svg.setAttribute("class", mode);
        if (typeof modes[mode][event] === "function") {
            modes[mode][event](e);
        }
    }

})();
