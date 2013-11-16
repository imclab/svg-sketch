(function () {
    "use strict";

    var svg = document.getElementById("svg"),
        elements = document.getElementById("elements"),
        toolbar = document.getElementById("toolbar"),
        modes = {
            pen:    {
                is_drawing: false,
                element:    null,
                element_d:  "",
                mousedown:  function (e) {
                    this.is_drawing = true;
                    this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    elements.appendChild(this.element);
                    this.element_d = " M " + e.offsetX + ", " + e.offsetY;
                    this.element.setAttribute("d", this.element_d);
                },
                mousemove:  function (e) {
                    if (!this.is_drawing) return;
                    this.element_d += " L " + e.offsetX + ", " + e.offsetY;
                    this.element.setAttribute("d", this.element_d);
                },
                mouseup:    function () {
                    this.is_drawing = false;
                }
            },
            select: {
                is_moving:           false,
                move_start_position: null,
                element:             null,
                mousemove:           function (e) {
                    if (this.is_moving) {
                        var tx = e.offsetX - this.move_start_position.x,
                            ty = e.offsetY - this.move_start_position.y;
                        this.element.setAttribute("transform", "translate(" + tx + "," + ty + ")")
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
                }
            }
        };

    svg.addEventListener("mousedown", process);
    svg.addEventListener("mousemove", process);
    svg.addEventListener("mouseup", process);

    function process(e) {
        var event = e.type,
            mode = toolbar.mode.value;
        if (typeof modes[mode][event] === "function") {
            modes[mode][event](e);
        }
    }

})();
