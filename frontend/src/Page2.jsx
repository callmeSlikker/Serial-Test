import { useState } from 'react';
import { HypercomMessageHelper } from './utils/HypercomMessageHelper';
import { Buffer } from 'buffer';
import { MsgUtils } from './utils/MsgUtils';

export default function Page2() {
  const [header, setHeader] = useState("600000000010");
  const [transactionCode, setTransactionCode] = useState("20");
  const [responseCode, setResponseCode] = useState("00");
  const [moreIndicator, setMoreIndicator] = useState("0");
  const [fields, setFields] = useState([
    { tag: "40", value: "000000000100" },
  ]);

  const [response, setResponse] = useState("0");

  const [output, setOutput] = useState("");
  const [responseMessage, setresponseMessage] = useState("");

  const Cmmond20 = ["02", "D0", "03", "04", "01", "65", "16", "D1", "D2", '30', "31", "50", "D3"]

  const resp20 = "02029436303030303030303030313135363030301C30320040303139393939393032303030303030323530303030303030303030313530303030303030303030311C443000694D65726368616E742031202020202020202020202020204D65726368616E745F41646431202020202020202020204D65726368616E745F41646431202020202020202020201C303300063235313030391C303400063137313732301C303100063032303033381C363500063030303032381C3136000838303232353530321C443100153030303030323230303836393235331C44320010564953412D43415244201C33300016343339313337585858585858313130371C33310004585858581C353000063030303030311C443300123030303032313034393836301C4434000230341C03D1"

  const handleChangeField = (index, key, val) => {
    const newFields = [...fields];
    newFields[index][key] = val;
    setFields(newFields);
  };

  // ✅ เพิ่ม field ใหม่
  const addField = () => setFields([...fields, { tag: "", value: "" }]);

  // ✅ ลบ field ตาม index
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };


  const CheckField = (code, Response) => {
    let msgStr = null
    if ((code == "20") || (code == "56")) {
      Cmmond20.forEach((tag) => {
        const f = HypercomMessageHelper.getByTag(Response, tag)
        if (f == null) {
          msgStr += `Tag: ${tag} no datat in response `;
        } else {
          msgStr += `Tag: ${f.tag}, Len: ${f.length}, Val: ${f.value}, hex: ${f.raw} ` + '\n';
        }
      })
    }
    else {
      const allFields = HypercomMessageHelper.getTagList(buff)
      console.log(allFields);
      // 🔁 วนลูปแต่ละ field
      allFields.forEach(f => {
        msgStr += `Tag: ${f.tag}, Len: ${f.length}, Val: ${f.value}, hex: ${f.raw} ` + '\n';
      });

    }
    return msgStr
 
  };

  const TestValidateFfield = () => {

    // const msg = HypercomMessageHelper.build({
    //   header: 'TESTHEADER',
    //   transactionCode: '01',
    //   responseCode: '00',
    //   moreIndicator: '0',
    //   fields: {
    //     '01': 'CustomerName',
    //     '02': '12345678',
    //     '03': 'Approved'
    //   }
    // });
    // setHex(msg.toString('hex').toUpperCase());
    // setTags(HypercomMessageHelper.getTagList(msg));

    // const msg = {
    //   header: '600000000310',
    //   transactionCode: 'P3',
    //   responseCode: '00',
    //   moreIndicator: '0',
    //   fields: {
    //     '40': '000000000100',
    //     '30': '6223540009288112',
    //     '31': '0728',
    //     'D3': '998877665544'
    //   }
    // }

    // const buf = HypercomMessageHelper.build(msg)
    // console.log('Buffer:', buf);

    const buff = Buffer.from(resp20.trim(), "hex")
    const obj = HypercomMessageHelper.parse(buff);
    let msgStr = resp20.trim() + "\n";

    msgStr += obj.header + "\n";
    msgStr += obj.transactionCode + "\n";
    msgStr += obj.responseCode + "\n";
    msgStr += obj.moreIndicator + "\n";

    msgStr += CheckField(obj.transactionCode ,buff)

    setresponseMessage(msgStr);
   
  };

  const handleBuild = () => {
    const obj = {
      header,
      transactionCode,
      responseCode,
      moreIndicator,
      fields: Object.fromEntries(fields.map(f => [f.tag, f.value]))
    };

    const msg = HypercomMessageHelper.build(obj);
    const hex = Array.from(msg)
      .map(b => b.toString(16).padStart(2, "0"))
      .join(" ")
      .toUpperCase();

    setOutput(hex);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hypercom Message Builder</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Header"
          value="Header"
          readOnly
        />
        <input
          className="border p-2 rounded"
          placeholder="Transaction Code"
          value="Transaction Code"
          readOnly
        />
        <input
          className="border p-2 rounded"
          placeholder="Response Code"
          value="Response Code"
          readOnly
        />
        <input
          className="border p-2 rounded"
          placeholder="More Indicator"
          value="More Indicator"
          readOnly
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Header"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Transaction Code"
          value={transactionCode}
          onChange={(e) => setTransactionCode(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Response Code"
          value={responseCode}
          onChange={(e) => setResponseCode(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="More Indicator"
          value={moreIndicator}
          onChange={(e) => setMoreIndicator(e.target.value)}
        />
      </div>

      <h2 className="text-lg font-semibold mb-2">Fields (TLV)</h2>
      {fields.map((f, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Tag"
            value={f.tag}
            onChange={(e) => handleChangeField(i, "tag", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Value"
            value={f.value}
            onChange={(e) => handleChangeField(i, "value", e.target.value)}
          />
          <button
            onClick={() => removeField(i)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            🗑 Remove
          </button>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3" >
        <button
          onClick={addField}
          className="bg-gray-200 px-3 py-1 rounded mb-4 hover:bg-gray-300"
        >
          + Add Field
        </button>

        <button
          onClick={handleBuild}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Build Message
        </button>
      </div>



      <textarea
        className="border p-2 w-full h-40 mt-4 font-mono text-sm"
        value={output}
        readOnly
      />


      <div>
        <button
          onClick={TestValidateFfield}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          verify Message
        </button>
      </div>
      <textarea
        className="border p-2 w-full h-40 mt-4 font-mono text-sm"
        value={responseMessage}
        readOnly
      />

    </div>
  );
}
