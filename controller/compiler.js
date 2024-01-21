const { exec } = require("child_process");
const fs = require("fs");

const generateRandomCode = () => {
  const length = 8;
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomCode += charset.charAt(randomIndex);
  }

  return randomCode;
};

const error_file_name_remover = (contents, replacements, errorstr) => {
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  for (i = 0; i < contents.length; i++) {
    errorstr = errorstr.replace(
      new RegExp(escapeRegExp(contents[i]), "g"),
      replacements[i]
    );
  }
  return errorstr;
};

const create_file = (file_names, datas) => {
  try {
    for (i = 0; i < file_names.length; i++) {
      fs.writeFileSync(file_names[i], datas[i]);
    }
  } catch (error) {
    return error;
  }
};

const delete_file = (file_names) => {
  try {
    for (i = 0; i < file_names.length; i++) {
      fs.unlinkSync(file_names[i]);
    }
  } catch (error) {
    return error;
  }
};

const python_compiler = (req, res) => {
  const randomCode = generateRandomCode();

  const file = randomCode + ".py";

  const filepath = "tempfile/" + randomCode + ".py";
  const inputpath = "tempfile/" + randomCode + ".txt";

  const code = `#!/usr/bin/env python3\n\n` + req.body.code;
  const input = req.body.input;

  try {
    create_file([filepath, inputpath], [code, input]);
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }

  exec(`python3 ${filepath} < ${inputpath}`, (error, stdout, stderr) => {
    try {
      delete_file([filepath, inputpath]);
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }

    if (error) {
      //splitting the error message without exposing the file name
      let errorarr = error.message.split(file + '",');
      let errorresponse = error_file_name_remover(
        [filepath, inputpath],
        ["file.py", "file"],
        errorarr[errorarr.length - 1]
      );

      return res.status(200).json({ output: errorresponse });
    } else {
      return res.status(200).json({ output: stdout });
    }
  });
};

const c_compiler = (req, res) => {
  const randomCode = generateRandomCode();

  const file = "tempfile\\" + randomCode;

  const cscript = file + ".c";
  const cinput = file + ".txt";

  const scriptContent = req.body.code;
  const userInput = req.body.input;

  if (!fs.existsSync("tempfile")) {
    fs.mkdirSync("tempfile");
  }

  try {
    fs.writeFileSync(cscript, scriptContent);
    fs.writeFileSync(cinput, userInput);
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }

  exec(
    `gcc ${cscript} -o tempfile\\${randomCode}`,
    { shell: "cmd" },
    (compileError, compileStdout, compileStderr) => {
      if (compileError || compileStderr) {
        fs.unlinkSync(cscript);
        fs.unlinkSync(cinput);
        const newerrorstr = error_file_name_remover(
          [cscript, file],
          ["file.c", "file"],
          compileError.message
        );

        return res.status(200).json({ output: newerrorstr });
      }
      fs.unlinkSync(cscript);

      // Execute the compiled C program with input
      exec(
        `tempfile\\${randomCode} < ${cinput}`,
        { shell: "cmd" },
        (runError, runStdout, runStderr) => {
          fs.unlinkSync(cinput);
          fs.unlinkSync(file + ".exe");
          if (runError) {
            return res.status(200).json({ output: runError });
          } else if (runStderr) {
            return res.status(500).json({ output: runStderr });
          } else {
            return res.status(200).json({ output: runStdout });
          }
        }
      );
    }
  );
};

module.exports = { python_compiler, c_compiler };
