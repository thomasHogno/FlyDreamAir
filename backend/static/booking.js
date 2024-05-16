const options = { //SET VALUE FOR THE DATE
    year: 'numeric', 
    month: 'short', 
    day: '2-digit', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
};

$(document).ready(function() { // CLICK LOGO TO GO THE HOMEPAGE
    $('.logo').click(function() {
        window.location.href = '/';
    });

    const tabs = $(".tab");
    const tabContents = $(".tab-content");

    tabs.click(function() {
        const tabName = $(this).data("tab");
        showTab(tabName);
        tabs.removeClass("active");
        $(this).addClass("active");
        history.pushState(null, null, `#${tabName}`);
    });

    $(window).on("popstate", function(event) {
        const tabName = location.hash.slice(1);
        showTab(tabName);
    });

    function showTab(tabName) {
        tabContents.each(function() {
            if (this.id === tabName) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    if(window.location.hash === '#passengers'){
        $('#passengers').addClass("active");
    }

    // TAB DISPLAY BASED ON HASH
    const initialTab = location.hash.slice(1);
    showTab(initialTab);


                        window.location.hash = "passengers";
                        tabs.removeClass("active");
});

