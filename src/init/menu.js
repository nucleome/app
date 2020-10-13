import factory from "../utils/factory"
import config from "../config"
const panelDbName = config.panelDb
export default function() {
    var dispatch
    var renders
    var renderList
    var chart = function(el) {
        var sign = false
        var TOHIDE
        $(".menu > ul > li").mouseover(function(event) {
            if (TOHIDE) {
                clearTimeout(TOHIDE)
            }
            if ($(event.target).closest(".frame").length === 1) {
                return;
            }
            $(".menu .frame").hide();
            $(this).find('.frame').show();
            $(".menu > ul > li").removeClass("selected");
            $(this).addClass("selected");
        })
        $(".menu > ul > li").mouseout(function() {
            //$(this).find('.frame') //TODO
            var t = $(this)
            TOHIDE = setTimeout(function(e) {
                if (!sign) {
                    t.removeClass("selected");
                    t.find('.frame').hide();
                }
            }, 500)
        })
        $('.frame').mouseover(function() {
            sign = true
        })
        $(".frame").mouseout(function() {
            $(".menu > ul > li").removeClass("selected");
            sign = false
        })
        //TODO
        var spaceOn = false
        var spaceUl = d3.select("#menuContainer").append("ul")

        /* using localforage */
        /* TODO Set DB Name */
        var panelDb = localforage.createInstance({
            "name": panelDbName
        })
        var renderSpaceList = function() {
            panelDb.keys().then(function(list) {
                var _li = spaceUl.selectAll("li").data(list)
                _li.exit().remove()
                _li.enter().append("li")
                    .merge(_li)
                    .call(_chart)

            })

           var _chart = function(selection) {
                selection.each(function(d) {
                    var el = d3.select(this).style("height", "37px")
                    el.style("cursor", "default").style("background-color", "#333")
                    el.on("mouseover", function() {
                        d3.select(this).style("background-color", "#555")
                    }).on("mouseout", function() {
                        d3.select(this).style("background-color", "#333")
                    })
                    el.selectAll("*").remove()
                    el.append("div").style("float", "left").style("font-size", "12px").text(d)
                    var elR = el.append("div")
                        .style("float", "right")
                        .style("top","-5px")
                        .classed("btn-group", true)

                    elR.append("button")
                        .attr("type", "button")
                        .classed("btn", true)
                        .classed("btn-xs", true)
                        .classed("btn-default", true)
                        .classed("glyphicon", true)
                        .classed("glyphicon-open", true)
                        .on("click", function() {
                            panelDb.getItem(d).then(function(v) {
                                var state = JSON.parse(v)
                                var a = {
                                    title: state.name,
                                    type: 'component',
                                    componentName: 'canvas',
                                    componentState: JSON.parse(JSON.stringify(state))
                                };
                                dispatch.call("loadPanel", this, a)
                            })
                        })
                    elR.append("button")
                        .attr("type", "button")
                        .classed("btn", true)
                        .classed("btn-xs", true)
                        .classed("btn-default", true)
                        .classed("glyphicon", true).classed("glyphicon-remove", true).on("click", function() {
                            var r = window.confirm("Delete panel " + d + " in workspace?")
                            if (r == true) {
                                var v = panelDb.removeItem(d).then(function() {
                                    el.remove()
                                    dispatch.call("sendMessage", this, {
                                        code: "refreshWorkSpace",
                                        data: ""
                                    })
                                })
                            }
                        })

                })
            }

        }
        $("#space").on("click", function() {
            if (spaceOn) {
                $("#menuContainer").width("0%").hide()
                $("#layoutContainer").width("100%").css("left", "0%")
                dispatch.call("resize", this, {})
            } else {
                $("#menuContainer").width(200).show()
                $("#layoutContainer").css('width',"100%").css("width","-=200px").css("left", "200px")
                dispatch.call("resize", this, {})
                renderSpaceList()
            }
            spaceOn = !spaceOn
            if (spaceOn) {
                $("#space").css("background-color","rgba(71,132,73,0.5)")
            } else {
                $("#space").css("background-color","")
            }
        })
    
        dispatch.on("refreshWorkSpace", function() {
            renderSpaceList()
        })
        $("#export").on("click", function(_) {
            dispatch.call("exportStates", this, _)
        })
        $("#import").on("click", function(d) {
            dispatch.call("importStates", this, function(d) {
            })
        })
        $("#manage").on("click", function(d) {
            dispatch.call("manageStates")
        })
        
        var renderLis = d3.select("#renders").selectAll("li").data(renderList)
            .enter()
            .append("li")
            .attr("title", function(d) {
                if (renders[d].tooltip) {
                    return renders[d].tooltip
                } else {
                    return d
                }
            })
            .attr("data-toggle","tooltip")
            .attr("data-placement","bottom")
            .on("click", function(d) {
                $(".menu .frame").hide();
                if (renders[d].id) {
                    dispatch.call("add", this, factory(renders[d]))
                } else {
                    dispatch.call("add", this, factory(d))
                }
            })

        renderLis.append("span")
            .classed("glyphicon", true)
            .classed("glyphicon-plus", true)
        renderLis.append("span")
            .attr("id", function(d) {
                return d
            }).text(
                function(d) {
                    if (renders[d].label) {
                        return " " + renders[d].label
                    } else {
                        return " " + d
                    }
                }
            )

    }
    chart.dispatch = function(_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }
    chart.renders = function(_) {
        return arguments.length ? (renders = _, chart) : renders;
    }
    chart.renderList = function(_) {
        return arguments.length ? (renderList = _, chart) : renderList;
    }
    return chart
}
