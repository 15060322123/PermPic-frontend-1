<template>
  <div class="blog-preview-barrier">
    <div class="header">
      <div class="img" v-if="blog.isShowBanner">
        <img :src="getMyBanner" alt="" />
      </div>
      <div class="title">{{ blog.title }}</div>
    </div>
    <div class="content">
      <p class="article">{{ blog.previewContent }}</p>
      <div class="more-group">
        <div class="more" v-if="isAll" @click="readMore">
          <a>{{ $t("blog.readAll") }}</a>
        </div>
        <div class="more" v-if="isAll && (!blog.sync || blog.sync == 1)">
          <el-popover placement="top" width="160" v-model="visible" @show="showArFee">
            <div v-loading="popLoading">
              <p>{{ $t("blog.syncFee") }}<br />{{ arFee }}AR</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="visible = false">{{
                  $t("blog.cancel")
                }}</el-button>
                <el-button type="danger" size="mini" @click="syncAr" v-if="!blog.sync">{{ $t("blog.confirm") }}</el-button>
              </div>
            </div>
            <a slot="reference">{{
              blog.sync == 1 ? $t("blog.Synchronizing") : $t("blog.SyncToAr")
            }}</a>
          </el-popover>
        </div>
        <div class="more" v-if="blog.sync == 2" @click="handleCopy($event)">
          <a>{{ $t("blog.share") }}</a>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="author word-ellipsis">
        <i class="fa fa-user-o" aria-hidden="true"></i>
        <span>{{ blog.author || $t("blog.anonymous") }}</span>
      </div>
      <div class="date">
        <i class="fa fa-calendar" aria-hidden="true"></i>
        <span>{{ blog.updateTime }}</span>
      </div>
      <div class="tags word-ellipsis">
        <i class="fa fa-tags" aria-hidden="true"></i>
        <span v-for="tag in blog.tags">#{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import FrontConfig from "../../../config/FrontConfig";
import EventHub from "../../../utils/EventHub";
import Aes from "../../../utils/Aes";

import {
  getArPrice,
  preparePermPicTransaction,
  permPicUpload
} from "permpic-core-test";
import Md5 from "../../../utils/Md5";

export default {
  name: "BlogPreview",
  props: {
    blog: Object
  },
  data() {
    return {
      isAll: true,
      visible: false,
      arFee: 0,
      popLoading: false
    };
  },
  mounted() {},
  computed: {
    getMyBanner() {
      var bannerImg =
        FrontConfig.blogBanners[
          Math.floor(Math.random() * FrontConfig.blogBanners.length)
        ];
      return require("../../../static/img/blog_banner/" + bannerImg);
    }
  },
  methods: {
    readMore() {
      this.$router.push({
        name: "blogArticle",
        params: {
          id: this.blog.createTime,
          isReadable: true,
          key: this.blog.title
        }
      });
    },
    async showArFee() {
      this.popLoading = true;
      this.arFee = await getArPrice(this.blog.htmlContent.length);
      this.popLoading = false;
    },
    async syncAr() {
      if (this.$store.state.wallet.balance - this.arFee < 0) {
        EventHub.$emit("goTip", [this.$t(blog.insufficient), false, 1500]);
        return false;
      }
      let metaData;
      this.$store.state.logList.forEach((element, index) => {
        if (element.createTime == this.blog.createTime) {
          metaData = {
            ...this.$store.state.logList[index],
            ...{
              title: this.blog.title,
              tags: this.blog.tags,
              isShowBanner: this.blog.isShowBanner,
              createTime: this.blog.createTime,
              updateTime: this.blog.updateTime,
              "Content-Type": "text/html"
            }
          };
        }
      });
      metaData.htmlContent && delete metaData.htmlContent;
      metaData.textContent && delete metaData.textContent;
      // if (metaData.htmlContent) {
      //   delete metaData.htmlContent;
      // }
      // if (metaData.textContent) {
      //   delete metaData.textContent;
      // }

      const { address, balance, walletPrivateKey } = this.$store.state.wallet;

      let tx = await preparePermPicTransaction(
        { address, balance, walletPrivateKey },
        this.blog.privacy == "public"
          ? this.blog.htmlContent
          : Aes.encryptAes(
              this.blog.htmlContent,
              Md5.permPicEncryptMd5(Number(this.blog.createTime))
            ),
        metaData
      );

      const uploader = await permPicUpload(tx);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(
          `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
      }
      this.blog.sync = 1;
      EventHub.$emit("goTip", [this.$t("blog.waitBlockSync")]);
      this.visible = false;
    },
    handleCopy(event) {
      EventHub.handleClipboard(
        `${location.origin + location.pathname}#/blog/blog_article/${
          this.blog.arid
        }/true/${Md5.permPicEncryptMd5(Number(this.blog.createTime))}`,
        event
      );
    }
  }
};
</script>

<style>
.el-popover {
  background: rgba(7, 7, 7, 0.85) !important;
  color: #fff;
}
.el-button--danger {
  background-color: #d4515e;
  border-color: #d4515e;
}
</style>
<style scoped>
.blog-preview-barrier {
  width: 90%;
  margin: 20px auto;
  background-color: rgba(42, 42, 42, 0.85);
}
.blog-preview-barrier:first-child {
  margin-top: 0;
}
.blog-preview-barrier .header {
  box-sizing: border-box;
  border-bottom: 1px solid rgba(104, 104, 104, 0.91);
}
.blog-preview-barrier .header .img {
  width: 100%;
  height: 150px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(67, 67, 67, 0.8);
}
.blog-preview-barrier .header img {
  width: 100%;
  height: 100%;
}

.blog-preview-barrier .header .title {
  text-align: left;
  padding-left: 15px;
  font-size: 27px;
  color: #4f98af;
  height: 50px;
  line-height: 50px;
}
.blog-preview-barrier .content .article {
  font-size: 20px;
  max-height: 6em;
  color: #dadada;
  line-height: 1.5em;
  font-family: STKaiti, LiSu, STXinwei;
  font-style: normal;
  text-align: left;
  text-indent: 2em;
  padding: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 4;
}
.blog-preview-barrier .content .more {
  height: 25px;
  background-color: #2e2e2e;
  min-width: 80px;
  max-width: 120px;
  margin: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  color: rgba(157, 157, 157, 0.67);
}
.blog-preview-barrier .content .more-group {
  display: flex;
}
.blog-preview-barrier .content .more:hover {
  cursor: pointer;
  background-color: #d4515e;
  color: white;
}

.blog-preview-barrier .footer {
  border-top: 1px solid rgba(104, 104, 104, 0.91);
  height: 50px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-align: left;
  color: rgba(117, 117, 117, 0.77);
  font-size: 14px;
}
.blog-preview-barrier .footer .author,
.blog-preview-barrier .footer .date,
.blog-preview-barrier .footer .tags {
  margin-left: 10px;
}
.blog-preview-barrier .footer i {
  margin-right: 5px;
}
.blog-preview-barrier .footer .date {
  max-width: 140px;
  font-family: sans-serif;
}
.blog-preview-barrier .footer .tags span {
  margin-right: 10px;
}
</style>