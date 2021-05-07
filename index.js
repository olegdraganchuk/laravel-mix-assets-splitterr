let fs = require('fs');
let mix = require('laravel-mix')
let { Str } = require('laravel-js-str')
const path = require('path');

const str = value => Str.of(value);

const CollectFiles = (folder, files = []) => {
    const isFolder = to => fs.statSync(to).isDirectory();
    const CombineFiles = (Files, Segments = []) => {
      return [ ...Files, path.join(Segments[0], '/', Segments[1])];
    };

    return fs.readdirSync(folder).reduce((list, file, index, original) =>
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

    /**
     * All dependencies that should be installed by Mix.
     *
     * @return {Array}
     */
    dependencies() {
        return ['laravel-js-str'];
    }

    /** Run The Split Command via a specific mix method **/
    register(via, folder, to, allowedExt, ...parameters) {
        CollectFiles(folder).map(file => str(file).afterLast(file, '/').toString())
            .filter(file => {
              let allowed = false;
              if (typeof allowedExt !== 'undefined') {
                let ext = path.extname(file);
                if (allowedExt == ext) {
                  allowed = true;
                }
              }
              return file !== null && typeof file !== "undefined" && allowed;
            })
            .forEach(
                file => {
                  console.log(file);
                    if (typeof parameters === 'undefined') {
                      via(path.resolve(Mix.paths.rootPath, `${file}`), path.resolve(Mix.paths.rootPath, (`${to}`)));
                    } else {
                        via(path.resolve(Mix.paths.rootPath, `${file}`), path.resolve(Mix.paths.rootPath, (`${to}`)), ...parameters);
                    }
                }
       );
    }
};


mix.extend('split', new CodeSplit());
