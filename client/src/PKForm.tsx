import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function PKForm() {
    const [inputs, setInputs] = useState({});

    const [Res, setRes] = useState("");

    async function handleChange(e: any): Promise<void> {
        setInputs(state => ({ ...state, [e.target.name]: e.target.value }));
    }

    async function submit(e: any): Promise<void> {
        e.preventDefault();
        setRes(inputs.PK + " " + inputs.name);

    }

    return (
        <form onSubmit={submit}>
            <label>Public Key: &nbsp;
                <input
                    id="PKF"
                    type="text"
                    name="PK"
                    value={inputs.PK || ""}
                    placeholder="Public Key"
                    onChange={handleChange}
                />
            </label>
            <label>&nbsp;Name:&nbsp;
                <input
                    id="PKF"
                    type="text"
                    name="name"
                    value={inputs.name || ""}
                    placeholder="Optional"
                    onChange={handleChange}
                />
            </label>
            <input type="submit" />
            <>  {Res }</>
            
        </form>
    )

    //<button label="Submit" onclick={submit} >Submit</button>
    //nChange={(e) => setName(e.target.value)}

    /*return (
    <input id="PKForm" type="text" placeholder="Public Key"
        onChange={(e) => setName(e.target.value)} />
    < button id = "SubmitButton" onClick = { searchWatched } > s</button > <br />
    )*/


}

export default PKForm;