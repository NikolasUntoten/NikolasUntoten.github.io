function start(name) {
    $(function() {
        $("#navbar").load("/resources/prefabs/navigation.html", function() {
            $("#"+name+"Link").removeClass("standard").addClass("selected");
        });
    });
}
