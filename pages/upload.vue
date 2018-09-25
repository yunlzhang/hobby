<template>
    <div class="main">
        <div class="upload-wrap">
            <el-upload
                class="upload"
                drag
                :fileList="fileList"
                :action="uploadUrl"
                :data="{path:'photography'}"
                name="pic"
                list-type="picture"
                :withCredentials="true"
                :beforeUpload="beforeUpload"
                :onSuccess="onSuccess"
                multiple>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
        </div>
        <div class="other">
            <div class="date-picker">
                时间：
                <el-date-picker
                v-model="date"
                type="date"
                placeholder="选择日期"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd">
                </el-date-picker>
            </div>
            <div>
                地点
                <el-input v-model="location" placeholder="请输入内容"></el-input>
            </div>
            <div>
                感受
                <el-input
                type="textarea"
                :autosize="{minRows: 4}"
                placeholder="请输入内容"
                v-model="description">
                </el-input>

            </div>
            <div class="save" @click="save">保存</div>
        </div>
    </div>
</template>

<script>
    export default {
        asyncData(context) {
            // called every time before loading the component
            // return {
            //     name: ''
            // }
        },
        fetch() {
            // The fetch method is used to fill the store before rendering the page
        },
        head() {
            return {
                title: '上传文件',
                meta: [
                    { hid: 'description', name: 'description', content: 'upload document' }
                ]
            }
            // Set Meta Tags for this Page
        },
        data() {
            return {
                fileList:[],
                description:'',
                location:'',
                date:'',
                photos:[],
                uploadUrl:process.env.NODE_ENV !== 'development' ? 'https://api.lcddjm.com/upload': 'http://localhost:8083/upload'
            }
        },
        methods:{
            beforeUpload(file){
                console.log(file);
            },
            onSuccess(file,fileList){
                console.log(file);
                if(file.code != 200){
                    return this.$message({
                        message: file.message,
                        type: 'info'
                    })
                }
                let item = {}; 
                let _this = this;               
                fileList.name =  file.img;
                // this.fileList.push(fileList);                 
                item.src = (process.env.NODE_ENV === 'production' ? 'https://image.lcddjm.com' : 'http://localhost:8083' ) + file.img
                let newImage = new Image();
                newImage.onload = function(){
                    item.w = this.width;
                    item.h = this.height;
                    item.size = fileList.size;
                    _this.photos.push(item);
                }
                newImage.src = fileList.url;               
            },
            save(){
                this.$axios({
                    method:'post',
                    data:{
                        photos:this.photos,
                        time:this.date,
                        location:this.location,
                        description:this.description
                    },
                    withCredentials:true,
                    url:this.HOST + '/hobby/save_tourist'
                })
                .then(res => {
                    if(res.data.code == 200){
                        this.$message({
                            message: '发表成功',
                            type: 'success'
                        });
                    }else{
                        this.$message({
                            message: res.data.message,
                            type: 'info'
                        });
                    }
                })
            }
        }
        // and more functionality to discover
    }

</script>

<style lang="scss">
    .main{
        width:1080px;
        margin:0 auto;
        padding:20px 0 40px;
        overflow: hidden;
        >div{
            float:left;
            width:50%;
        }
    }
    .upload{
        text-align: center;
    }
    .other{
        >div{
            &:first-child{
                margin-top:0;
            }
            margin:20px;
        }
    }
    .save{
        width:120px;
        height:40px;
        text-align: center;
        line-height:40px;
        background:#0db4f9;
        color:#fff;
        cursor: pointer;
    }
</style>
