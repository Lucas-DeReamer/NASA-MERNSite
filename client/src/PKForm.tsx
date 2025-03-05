import { useState } from 'react';
//import ReactDOM from 'react-dom/client';

interface InputState {
    PK: string;
    name: string;
}

function PKForm() {
    const [inputs, setInputs] = useState<InputState>({
        PK: '',
        name: '',
    });

    const [Res, setRes] = useState("");

    async function handleChange(e: any): Promise<void> {
        setInputs(state => ({ ...state, [e.target.name]: e.target.value }));
    }

    async function submit(e: any): Promise<void> {
        e.preventDefault();

        const data = { PK: inputs.PK, name: inputs.name };
        const js = JSON.stringify(data);

        try {
            const response = await
                fetch('http://3.133.227.144/api/submit/',
                    {
                        method: 'POST', body: js, headers: {
                            'Content-Type':
                                'application/json',
                            'Accept': 'application/json'
                        }
                    });
            let txt = await response.text();
            let res = JSON.parse(txt);


            if (res.error == 1 || res.error == 2) {
                setRes(res.message);

            } else if (res.error == 3) {
                setRes('Server Error. Please try again later.');

            } else {

                const add1 = res.message % 255;
                const add2 = Math.floor(res.message / 255);
                const address = ("10.0." + add2 + "." + add1 + "/32");

                const WGtext = ("Address = " + address + "<br>"
                            + "DNS = 1.1.1.1\n\n"
                            + "[PEER]\n"
                            + "PublicKey = 1CIc2tMX3ULSXSSOm92KfPd31rL51sQvicCVp6mITyY=\n"
                            + "AllowedIPs = 0.0.0.0/0\n"
                            + "Endpoint = 18.221.62.217:51820");

                setRes(WGtext);


            }


        }
        catch (error: any) {
            setRes(error.toString());
        }

        
        /*localStorage.setItem('submit', JSON.stringify(data));
        let lsd: any = JSON.parse(localStorage.getItem('submit'));
        setRes(lsd.PK) */


        //setRes(inputs.PK + " " + inputs.name);

    } //end func submit

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