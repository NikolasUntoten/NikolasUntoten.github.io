function start(name) {
    $(function() {
        $("#navbar").load("/creation-online/resources/navigation.html", function() {
            $("#"+name).removeClass("standard").addClass("selected");
        });
    });
}
