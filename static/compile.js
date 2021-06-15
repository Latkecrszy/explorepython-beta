let codeArea = CodeMirror(document.getElementById("right"), {
            value: code,
            mode:  "python",
            lineNumbers: true,
            theme: "theme",
            indentUnit: 4
        });
let spacer = document.createElement("div")
spacer.id = "spacer"
let runButton = document.createElement("button")
runButton.addEventListener("click", () => {run()})
runButton.id = "run"
runButton.classList.add("run")
runButton.innerText = "Run ❯"
let clearButton = document.createElement("button")
clearButton.addEventListener("click", () => clear())
clearButton.id = "clear"
clearButton.classList.add("run")
clearButton.innerText = "Clear"
document.getElementById("right").appendChild(runButton)
document.getElementById("right").appendChild(spacer)
let output;
output = createShell('>>> ')
document.body.appendChild(clearButton)
codeArea.setSize(window.innerWidth/2, window.innerHeight/1.7)
async function run() {
    let code = codeArea.getValue()
    console.log(code)
    let results = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: 'POST',
        body: JSON.stringify({"language": "python", "version": "3.9.4", "files": [{"name": "code.py", "content": code}]})})

    console.log(results)
    results = await results.json()
    console.log(results)
    let previousOutput = output.getValue()
    output = createShell(previousOutput+'\n'+results['run']['stdout']+results['run']['stderr']+'\n>>> ')
    document.getElementById("right").children[3].remove()
    checkResults(results['run'])
}

function createShell(value) {
    output = CodeMirror(document.getElementById("right"), {
        value: value,
            mode: "python",
            lineNumbers: true,
            theme: "theme",
            indentUnit: 4}
    )
    output.setSize(window.innerWidth/2, window.innerHeight/2.57-60)
    keyBind(output)
    return output
}


function clear() {
    createShell('>>> ')
    document.getElementById("right").children[3].remove()
}

function keyBind(editor) {
    editor.setOption("extraKeys", {
        Enter: async () => {
            let content = editor.getValue()
            let splitContent = content.split(">>> ")
            console.log(splitContent)
            content = splitContent[content.split(">>> ").length-1]
            console.log(content)
            let results = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: 'POST',
                body: JSON.stringify({"language": "python", "version": "3.9.4", "files": [{"name": "code.py", "content": content}]})
            })
            results = await results.json()
            let previousOutput = output.getValue()
            output = createShell(previousOutput+'\n'+results['run']['stdout']+results['run']['stderr']+'\n>>> ')
            document.getElementById("right").children[3].remove()
        }
    })
}

function checkResults(results) {
    let regex = new RegExp(expected_output)
    console.log(expected_output)
    console.log(results)
    console.log(regex.test(results['stdout']))
    if (results['stderr'] !== '') {
        console.log("error")
        return send_notif("error", `Error: \n${results['stderr']}\nTry again!`)
    }
    if (!regex.test(results['stdout'])) {
        console.log("Incorrect")
        return send_notif("incorrect", `Incorrect output: \n${results['stdout']}\nTry again!`)
    }
    console.log("Correct")
    let responses = ["Great job!", "Good work!", "Great work!", "Good work!", "Nicely done!", "Nice job!", "Nice work!", "Well done!"]
    let response = responses[Math.floor(Math.random()*responses.length)];
    return send_notif("correct", `${response} Click Next to continue!`)
}
