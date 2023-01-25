import "isomorphic-fetch";
import { fillData } from "../../utils/utils";
import { About as Dto } from "../../prisma/generated/models";
const { assert } = require("chai");
require("dotenv").config();
require("../../server");
const url = `${process.env.TESTING_URL}`;
const doctypeName = "About";

let dataCreated = 0;
let dataUpdated = 0;
let dataDeleted = 0;

const baseURL = url + doctypeName;

//don't forget to update the schema ! you only need to initialize DTO

let reqCreateData: Dto = {
  id: 0,
  coverpic: "",
  galary: "",
  desc_en: "",
  desc_ar: "",
  desc_ku: "",
  desc_tr: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

let reqUpdateData: Dto = {
  id: 0,
  coverpic: "",
  galary: "",
  desc_en: "",
  desc_ar: "",
  desc_ku: "",
  desc_tr: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe(`${doctypeName}Controller`, function () {
  let token;
  before(async () => {
    if (token === undefined) {
      const rawRes = await fetch(`${url}User/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: `${process.env.TESTING_USERNAME}`,
          Password: `${process.env.TESTING_PASSWORD}`,
        }),
      });
      const data = await rawRes.json();
      token = "Bearer " + data.token.token;

      console.log("habib", JSON.stringify(data), token);
    }

    fillData(reqCreateData);
    fillData(reqUpdateData);

    console.log({ reqCreateData, reqUpdateData });
  });

  describe(`test ${doctypeName} CRUD`, function () {
    it("should create Data Succefully", async function () {
      console.log(reqCreateData);
      const rawRes = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(reqCreateData),
      });

      const data = await rawRes.json();
      console.log(data);
      await assert(
        data !== undefined && !data.status && !data.message,
        `${doctypeName} was not created Succeffully`
      );

      setTimeout(async function () {
        console.log({ dataCreated });
        await assert(dataCreated === 1, "Socket in Create is not working");
      }, 25);

      reqUpdateData.id = data.id;
    });

    it(`should update ${doctypeName} successfuly`, async function () {
      const rawRes = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ ...reqUpdateData }),
      });
      console.log({ rawRes });

      const data = await rawRes.json();

      console.log({ data });

      await assert(
        rawRes.status === 200,
        `${doctypeName} it is adding not updating `
      );

      const newData = await fetch(baseURL + "/" + reqUpdateData.id, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      const newJsonData = await newData.json();
      let all = true;

      for (let [key, value] of Object.entries(newJsonData)) {
        console.log(
          key,
          newJsonData[key],
          reqUpdateData[key],
          newJsonData[key] !== reqUpdateData[key]
        );
        if (key !== "createdBy" && newJsonData[key] !== reqUpdateData[key])
          all = false;
      }
      console.log({ all });
      // await assert(all, `${doctypeName}  is not updated Successfully`);

      setTimeout(async function () {
        console.log({ dataUpdated });
        await assert(dataUpdated === 1, "Socket in Update is not working");
      }, 25);
    });

    it(`should get all ${doctypeName}  Successfully`, async function () {
      const rawRes = await fetch(`${baseURL}?page=0&pageSize=10`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      const data = await rawRes.json();

      await assert(
        data.data !== undefined &&
          Array.isArray(data.data) &&
          rawRes.status === 200,
        "something Wrong with The Data"
      );
    });

    it(`should delete data ${doctypeName}  Successfully`, async function () {
      const rawRes = await fetch(`${baseURL}/${reqUpdateData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
      console.log({ rawRes });
      // const data = await rawRes.json();
      // console.log({ data });

      await assert(
        rawRes.status === 200 && rawRes.statusText === "OK",
        `${reqUpdateData.id} is not Deleted Successfully During to some reason`
      );
      setTimeout(async function () {
        console.log({ dataDeleted });
        await assert(dataDeleted === 1, "Socket in Delete is not working");
      }, 25);
    });

    it(`should fail when ${doctypeName} is not Found to be deleted`, async function () {
      const rawRes = await fetch(`${baseURL}/${reqUpdateData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
      console.log({ rawRes });
      const data = await rawRes.json();
      console.log({ data });

      await assert(
        rawRes.status === 404 && data.status && data.message,
        `something wrong with with failing response for the not found`
      );
    });
  });
});
