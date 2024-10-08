const {resolve} = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const tsRule = {
    test: /\.ts(x)?$/,
    exclude: /node_modules/,
    use: "ts-loader"
}

const cssRule = {
    test: /\.css$/,
    use: ["style-loader", "css-loader"]
}

const plugins = [
    new HtmlWebpackPlugin({
        template: "src/popup/popup.html",
        filename: "popup.html",
        chunks: ["popup"]
    }),
    new CopyWebpackPlugin({
        patterns: [
            {from: "public", to: "."},
            {from: "src/contentScript/insert.css", to: "."}
        ]
    }),
    new CleanWebpackPlugin()
]

module.exports = {
    mode: "production",
    entry: {
        popup: "./src/popup/popup.tsx",
        contentScript1: "./src/contentScript/contentScript1.ts",
        background: "./src/background/background.ts",
        insert: "./src/contentScript/insert.ts"
    }, 
    output: {
        filename: "[name].js",
        path: resolve(__dirname, "dist")
    }, 
    module:{
        rules: [tsRule, cssRule]
    },
    plugins,
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }
    
}