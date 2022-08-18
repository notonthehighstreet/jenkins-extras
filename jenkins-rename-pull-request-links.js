if (window.location.pathname.match(/view\/change-requests/)) {
    $$('#projectstatus a.model-link').each(function(pr_link) {
        console.log("hello world")
        pr_link.pr_number = pr_link.text
        pr_link.text = pr_link.title + " (" + pr_link.pr_number + ")"
    })
}
