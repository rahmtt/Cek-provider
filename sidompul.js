import axios from "axios";

const sidompul = async (number) => {
  if (!number) {
    return {
      success: false,
      message: "Nomor tidak boleh kosong",
      results: null,
    };
  }

  try {
    const { data } = await axios.get("https://bendith.my.id/end.php", {
      params: {
        check: "package",
        number: number,
        version: 2,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
      timeout: 15000,
    });

    if (!data.success) {
      return {
        success: false,
        message: data.message,
        results: null,
      };
    }

    return {
      success: true,
      results: data.data,
    };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message,
      results: null,
    };
  }
};

export { sidompul }; 
