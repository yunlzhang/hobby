<template>
    <section class="container">
        <div class="banner" >
            <el-carousel :interval="4000" type="card" :height="'33.33vw'">
                <el-carousel-item v-for="item in bannerData" :key="item">
                    <img :src="'/engine/'+ item" alt="">
                </el-carousel-item>
            </el-carousel>
        </div>
        <div class="content">
            <div class="nav">
                <h3>这些年我所去过的地方</h3>
                <div class="cate">
                    <div class="location">
                        <div class="select-wrap">
                            地点:
                            <el-select v-model="location" placeholder="请选择">
                                <el-option
                                    v-for="item in locations"
                                    :key="item._id"
                                    :label="item.key"
                                    :value="item._id">
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="time">
                        <div class="select-wrap">
                            时间:
                            <el-select 
                                v-model="time" 
                                placeholder="请选择">
                                <el-option
                                    v-for="item in times"
                                    :key="item._id"
                                    :label="item.key"
                                    :value="item._id">
                                </el-option>
                            </el-select>
                        </div>  
                    </div>
                </div>
            </div>

            <!-- 瀑布流 -->
            <div class="waterfall">
                <div class="waterfall-inner" id="waterfall-inner"></div>
                <div class="loading" v-if="!nodata" id="waterfall-loading">正在加载中</div>
                <div class="nodata" v-else>没有了～～～</div>
            </div>

        </div>
        
    </section>
</template>

<script>
    export default {
        async asyncData({app}) {
            let res = await app.$axios.get((process.env.NODE_ENV === 'development' ? 'http://localhost:8083' : 'https://api.lcddjm.com') + '/hobby/get_gather');
            return {
                bannerData: res.data.data.banner,
                locations:res.data.data.locations,
                times:res.data.data.times,
                photos: res.data.data.photos
            }
        },
        data() {
            return {
                bannerData:[],
                locations:[],
                times:[],
                location:'all',
                photos:[],
                time:'all',
                page:0,
                num:20,
                nodata:false
            }
        },
        mounted() {
            this.$nextTick(()=>{
                this.instantWaterFall();
            })
        },
        methods:{
            instantWaterFall(){
                let waterfall = new this.WaterFall({
                    container: '#waterfall-inner',
                    pins: ".pin",
                    loader: '#waterfall-loading',
                    gapHeight: 10,
                    gapWidth: 10,
                    pinWidth: 208,
                    threshold: 100
                });
                let _this = this;
                waterfall.on("load", function(){
                    _this.page++;
                    _this.getMore()
                    .then(res =>{
                        if(res.data.code == 200){
                            if(res.data.data.length){
                                _this.photos = _this.photos.concat(res.data.data);
                                waterfall.append(res.data.data);
                                new _this.LAZY();
                            }else{
                                _this.nodata = true;
                            }
                        }
                    })
                })
                
            },
            getMore(){
                return this.$axios({
                    url:this.HOST  + '/hobby/get_pic',
                    params:{
                        location:this.location,
                        time:this.time,
                        page:this.page,
                        num:this.num
                    },
                    type:'get'
                })
            }
        },

        components: {}
    }

</script>

<style lang="scss">
    .container {
        min-height: 100vh;
        width: 100%;
        .banner{
            width: 100%;
            margin-top:10px
        }
        
        .content{
            width:1080px;
            margin:0 auto;
            
        }
        .nav{
            width:1080px;
            height:80px;
            overflow:hidden;
            border-bottom:1px solid #ccc;
            h3{
                float:left;
                line-height:80px;                
            }
            .cate{
                float:right;
                height:100%;
            }
            .location,.time{
                float:left;
                height:100%;
                position: relative;
                margin-left:40px;
                display: flex;
                align-items: center;
            }
            
            
        }
        .waterfall{
            width:1080px;
            margin:40px auto 0;
            .loading{
                text-align: center;
            }
        }
        .waterfall-inner{
            position: relative;
            .pin{
                position: absolute;
                width:208px;
                img{
                    width: 100%;
                    box-sizing:border-box;
                    border:5px solid #ccc;
                    border-radius:5px;
                    background:#ccc;
                }
            }
        }
        .nodata{
            text-align: center;
            color:#bcbfc3;
        }

        .el-carousel__item img{
            max-width: 100%;
            position: absolute;
            top: 50%;
            left: 50%;
            background:#eeedeb;
            transform: translate(-50%,-50%);
        }
  
        // .el-carousel__item:nth-child(2n) {
        //     background-color: #99a9bf;
        // }
  
        // .el-carousel__item:nth-child(2n+1) {
        //     background-color: #d3dce6;
        // }   
    }
</style>