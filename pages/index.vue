<template>
    <section class="container">
        <div class="banner">
            <el-carousel :interval="4000" type="card" :height="'33.33vw'">
                <el-carousel-item v-for="item in bannerData" :key="item">
                    <img :src="'/engine/'+ item" alt="">
                </el-carousel-item>
            </el-carousel>
        </div>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                bannerData:[
                    '20171010-20171010-DSC_2019.jpg',
                    '20171010-20171010-DSC_2020.jpg',
                    '20171010-20171010-DSC_2068.jpg',
                    '20171010-20171010-DSC_2075.jpg',
                    '20171010-20171010-DSC_2078.jpg',
                    '20171010-20171010-DSC_2091.jpg',
                    '20171010-20171010-DSC_2190.jpg',
                    '20171010-20171010-DSC_2198.jpg',
                    '20171010-20171010-DSC_2223.jpg',
                    '20171011-20171011-DSC_2363.jpg',
                    '20171011-20171011-DSC_2367.jpg'
                ],
                currentPage1: 5,
                currentPage2: 5,
                currentPage3: 5,
                currentPage4: 4
            }
        },
        mounted() {
        },
        methods:{
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
        
        .el-carousel__item img{
            max-width: 100%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
        }
  
        .el-carousel__item:nth-child(2n) {
            background-color: #99a9bf;
        }
  
        .el-carousel__item:nth-child(2n+1) {
            background-color: #d3dce6;
        }   
    }
</style>