/**
 * todo 自动生成一个文件，而不是在控制台输出
 *       把所有的JS 和到一个里面，而不是现在的主要ＪＳ文件
 * Created by IntelliJ IDEA.
 * User: chenhuima
 * Date: 11-10-20
 * Time: 上午11:01
 * To change this template use File | Settings | File Templates.

kola("sohut.comm.PackageXML", function(PackageXML) {
    var packageXML = new PackageXML();

        packageXML.getAddJSFile({
            projectName:"p/talk"
 });
});
 */
kola("sohut.comm.PackageXML", ['kola.lang.Class',"newt.view.template.core.engine","jquery.Core"], function(Class,TemplateEngine,$) {

    var pkXMLSource = [
        '<root> ',
        '<project>{$T.projectName}</project> ',
        '<context> ',
        ' <source>e:/resources/j-src/</source> ',
        '<destination>e:/resources/j/</destination> ',
        '</context>  ',

        '<paths> ',
        '  <default path="http://s5.cr.itc.cn/j/{$T.projectName}/" /> ',

        ' <package name="kola"   path="http://s5.cr.itc.cn/j/{$T.projectName}/" /> ',
        '  <package name="sohu"   path="http://s5.cr.itc.cn/j/{$T.projectName}/" /> ',
        '  <package name="sohut"  path="http://s6.cr.itc.cn/j/{$T.projectName}/" /> ',
        '  <package name="newt" path="http://s7.cr.itc.cn/j/{$T.projectName}/" /> ',
        '</paths> ',

        '<files> ',
        '   <file path="http://s5.cr.itc.cn/j/{$T.projectName}/" file="kola/Package">  ',
            "<package>kola.Package</package>",
            "<package>Version</package>",
            "{#foreach $T.kolaContent as content}",
              "<package>"+"{$T.content}"+"</package>",
            "{#/for}",
        '	</file>  ',
        ' </files> ',
        '</root> '
    ].join("");

    var packageXML = Class.create({
        _init:function() {
            var self = this;
            TemplateEngine.addTemplate("sohut.comm.PackageXML.XML", pkXMLSource);
        },

        getAddJSFile:function(options) {
            var self = this;
             var opts=$.extend({
                 projectName:"p/huati",
                 success:function(data){
                       console.log(data);
                 },
                 failure:function(message){
                      console.log(message);
                 }
             },options);

            var returnArray=new Array();
            for(var i in kola.Package._statusMap){
              if(i!="sohut.comm.PackageXML")
                returnArray.push(i);
            }
            TemplateEngine.renderToText({
                    ui: "sohut.comm.PackageXML.XML",
                    data: {
                       kolaContent:returnArray,
                       projectName:opts.projectName
                    },
                    callback: function (text) {

                       opts.success(text);
                    }
            });
            return returnArray;

        }
    });

    return packageXML;
})
