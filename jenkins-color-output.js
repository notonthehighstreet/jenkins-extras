// ==UserScript==
// @name        Jenkins colored console
// @namespace   http://www.sapo.pt/
// @description Parses the build log output
// @include     https://*/job/*/console*
// @version     2
// @grant       none
// ==/UserScript==

addGlobalStyle(
    ".console-debug, .console-debug *      { color: purple !important}" +
    ".console-minor, .console-minor *      { color: #555 !important}" +
    ".console-faded, .console-faded *      { color: #888 !important}" +
    ".console-normal, .console-normal *    { color: #ddd }" +
    ".console-important, .console-important span { color: #C2E812 }" +
    ".console-warning { color: orange }" +
    ".console-success { color: #13CD48 }" +
    ".console-error { color: #F00 }" +
    ".console-hidden { display: none }"+
    ".console-stage { background-color: #2E5A61 !important; padding: 20px 10px !important; color: white !important; margin: 5px 0; }"+
    ".console-stage span { background-color: #2E5A61 !important; padding: 20px 0 !important; color: white !important; }"
); // 58A4B0 373F51

var timer = setInterval(parse_console_blocks, 200);

var foundBlocksTimeout = 10;

var patterns = [
    { stage: /\[Pipeline\] { \(/ },
    { hidden: /\[Pipeline\]/ },

    // git logs
    { minor: /&gt; git / },
    { minor: /The recommended git tool/ },
    { minor: />Running in Durability level/ },
    { minor: />Attempting to resolve/ },
    { minor: /^using credential/ },
    { minor: /^Found match/ },
    { faded: /^Fetching upstream/ },
    { minor: /^Fetching changes/ },
    { minor: /^[Uu]sing/ },
    { minor: /Attempting to resolve/ },
    { minor: /^Cloning the / },
    { minor: /^Avoid / },
    { faded: /^Cloning repo/ },
    { faded: /^Commit message/ },
    { faded: /^Checking out Rev/ },
    { minor: /^Loading library/ },
    { minor: /Obtained Jenkinsfile/ },
    { minor: /^Push event to/ },
    { minor: /^Seen/ },

    // docker logs
    { minor: /The push refers to repository/ },
    { minor: /: Pulling from/ },
    { minor: /: Pulling fs layer/ },
    { minor: /: Already exists/ },
    { minor: /: Layer already exists/ },
    { minor: /: Preparing/ },
    { minor: /: Waiting/ },
    { minor: /: Verifying/ },
    { minor: /: Pushed/ },
    { minor: /: (Download|Pull) complete/ },
    { minor: /Digest: sha/ },
    { minor: /\) Installing / },
    { minor: /\) Purging / },
    { minor: /\$ docker top/ },
    { minor: /\$ docker stop/ },
    { minor: /\$ docker rm/ },
    { minor: /span> Collecting / },
    { minor: /span> +Downloading / },
    { minor: /span> +Getting requirements / },
    { minor: /span> +Preparing wheel / },
    { minor: /span> +Building wheels / },
    { minor: /span> +Installing build dep/ },

    // java/jenkins stack trace
    { faded: /at [a-z_]+\.[a-z]+.+\(/ },
    { minor: /DescribableModel/ },
    { warning: /WorkflowScript:\d+/ },
    { warning: /Caused: / },
    { error: /java.lang.ClassCastException/ },

    // pip logs
    { minor: /Created wheel for/ },
    { minor: /Building wheel for/ },
    { minor: /Stored in directory/ },

    { faded: /INFO/ },
    { warning: /warning/ },
    { warning: /WARNING/ },
    { error: /ERROR/ },
    { error: /error/ },

    { important: /span> \+ / },

    { warning: /skipped due to/ },
    { minor: /\[WS-CLEANUP\]/ },
    { minor: /Slack Send Pipeline step running/ },
    { minor: /GitHub has been notified/ },

    { warning: /Finished: ABORTED/ },
    { success: /Finished: SUCCESS/ },
    { error: /Finished: FAILURE/ }
];

function parse_console_blocks() {
    var consoleBlocks = $$("pre.console-output:not(.parsed), #out pre:not(.parsed)");

    var foundBlocks = consoleBlocks.length > 0;
    if(foundBlocks) {
        foundBlocksTimeout = 20;
    } else if(--foundBlocksTimeout <= 0) {
        //clearInterval(timer);
    }

    consoleBlocks.forEach(parse_console_block);

    function parse_console_block(block) {
        console.log("Processing text block", block);
        Element.addClassName(block, "parsed");

        var lines = block.innerHTML.split("\n");

        var html = [];
        var currentLine = 0;

        parse_block_chunk();

        function parse_block_chunk() {
            for(var i = 0; i < 20; ++i, ++currentLine) {
                if(currentLine >= lines.length) {
                    block.innerHTML = html.join("");
                    return;
                }

                var line = lines[currentLine];
                var cssClass = select_class(line);

                if (cssClass == "debug") {
                    console.log(line);
                }

                var indentMatch = /^(\s*)(.*)/.exec(line);
                html.push(
                    "<div class='console-"+cssClass+"' style='padding-left: "+indentMatch[1].length+"ex'>" +
                    indentMatch[2] +
                    "</div>");
            }

            setTimeout(parse_block_chunk, 0);
        }
    }

    function select_class(line) {
        for(var i = 0; i < patterns.length; ++i) {
            for(var type in patterns[i]) {
                var pattern = patterns[i][type];
                if(pattern.test(line)) {
                    return type;
                }
            }
        }
        return "normal";
    }
}

function addGlobalStyle(css) {
    var head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
