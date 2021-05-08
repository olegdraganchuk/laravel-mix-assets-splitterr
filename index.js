let fs = require('fs');
let mix = require('laravel-mix')
const path = require('path');

const CollectFiles = (folder, files = []) => {
    const isFolder = to => fs.statSync(to).isDirectory();
    const CombineFiles = (Files, Segments = []) => {
      return [ ...Files, path.join(Segments[0], '/', Segments[1])];
    };

    return fs.readdirSync(folder).reduce((list, file) =>
            {
              if (isFolder(path.resolve(`${folder}/${file}`))) {
                return CollectFiles(path.resolve(`${folder}/${file}`), list);
              } else {
                return CombineFiles(list, [folder, file]);
              }
            },
        files
    );
};

/**
 * Compile Each File In A Directory To It's Own File without needing to individually list each one off
 */
class CodeSplit {
    /**
     * The optional name to be used when called by Mix.
     * Defaults to the class name.
     *
     * @return {String|Array}
     */
    name() {
        return ['split', 'codeSplit'];
    }

    /** Run The Split Command via a specific mix method **/
    register(allowedExt, folder, to, ...parameters) {
        let via;
        if (allowedExt == 'js') { via = mix.js; }
        if (allowedExt == 'scss') { via = mix.sass; }
        allowedExt = '.'+allowedExt;
        CollectFiles(path.resolve(folder) )
            .filter(file => {
              let fileName = path.parse(file).name;
              let fileExt = path.extname(file);
              let allowed = false;
              if (allowedExt == fileExt && fileName.substring(0, 1) !== '_') {
                allowed = true;
              }
              console.log(file, typeof file, allowed, fileExt);
              return file !== null && typeof file !== "undefined" && allowed;
            })
            .forEach(
                file => {
                    if (typeof parameters === 'undefined') {
                      via(path.resolve(Mix.paths.rootPath, `${file}`), path.resolve(Mix.paths.rootPath, (`${to}`)));
                    } else {
                        via(path.resolve(Mix.paths.rootPath, `${file}`), path.resolve(Mix.paths.rootPath, (`${to}`)), ...parameters);
                    }
                }
       );
    }
}

mix.extend('split', new CodeSplit());
