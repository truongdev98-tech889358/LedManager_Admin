import {
  CoreButton,
  CoreInput,
  CoreSelect,
  CoreTextArea,
  CoreUpload,
  CoreSwitch,
} from "@/components";
import { Form, Col, Row, Card, Breadcrumb } from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { createBanner, updateBanner, getBannerById } from "../apis";
import { BASE_URL, PageEnum } from "@/configs/constants";
import type { UploadFile } from "antd/es/upload/interface";

const BannerForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [desktopFileList, setDesktopFileList] = useState<UploadFile[]>([]);
  const [mobileFileList, setMobileFileList] = useState<UploadFile[]>([]);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [mobileVideoFileList, setMobileVideoFileList] = useState<UploadFile[]>([]);
  const [mediaType, setMediaType] = useState("Image");

  // Determine mode from URL path
  const pathname = window.location.pathname;
  const mode: "add" | "edit" | "view" = pathname.includes("/add")
    ? "add"
    : pathname.includes("/edit")
      ? "edit"
      : "view";

  const bannerTypeOptions = [
    { label: "Hero", value: "Hero" },
    { label: t("banner.announcement") || "Announcement", value: "Announcement" },
    { label: t("banner.promotional") || "Promotional", value: "Promotional" },
  ];

  const textPositionOptions = [
    { label: t("common.left") || "Left", value: "Left" },
    { label: t("common.center") || "Center", value: "Center" },
    { label: t("common.right") || "Right", value: "Right" },
  ];

  const positionOptions = [
    { label: "Home - Hero", value: "Home_Hero" },
    { label: "Home - How It Works", value: "Home_HowItWorks" },
    { label: "Home - Free Quote", value: "Home_FreeQuote" },
    { label: "Shop All - Header", value: "ShopAll_Header" },
    { label: "Collections - Header", value: "Collections_Header" },
  ];

  const mediaTypeOptions = [
    { label: "Image", value: "Image" },
    { label: "Video", value: "Video" },
  ];

  useEffect(() => {
    if (id && (mode === "edit" || mode === "view")) {
      fetchBanner();
    }
  }, [id, mode]);

  const fetchBanner = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getBannerById(parseInt(id));
      if (data) {
        form.setFieldsValue(data);
        setMediaType(data.mediaType || "Image");

        // Set desktop image
        if (data.imageUrl) {
          setDesktopFileList([{
            uid: '-1',
            name: 'desktop-image.png',
            status: 'done',
            url: `${BASE_URL || ""}${data.imageUrl}`,
          }]);
        }

        // Set mobile image
        if (data.mobileImageUrl) {
          setMobileFileList([{
            uid: '-2',
            name: 'mobile-image.png',
            status: 'done',
            url: `${BASE_URL || ""}${data.mobileImageUrl}`,
          }]);
        }

        // Set video
        if (data.videoUrl) {
          setVideoFileList([{
            uid: '-3',
            name: 'desktop-video.mp4',
            status: 'done',
            url: `${BASE_URL || ""}${data.videoUrl}`,
          }]);
        }

        // Set mobile video
        if (data.mobileVideoUrl) {
          setMobileVideoFileList([{
            uid: '-4',
            name: 'mobile-video.mp4',
            status: 'done',
            url: `${BASE_URL || ""}${data.mobileVideoUrl}`,
          }]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subtitle", values.subtitle || "");
      formData.append("description", values.description || "");
      formData.append("link", values.link || "");
      formData.append("buttonText", values.buttonText || "");
      formData.append("buttonLink", values.buttonLink || "");
      formData.append("buttonText2", values.buttonText2 || "");
      formData.append("buttonLink2", values.buttonLink2 || "");
      formData.append("textPosition", values.textPosition || "Left");
      formData.append("showOverlay", values.showOverlay?.toString() || "true");
      formData.append("bannerType", values.bannerType || "Hero");
      formData.append("sortOrder", values.sortOrder?.toString() || "0");
      formData.append("isActive", values.isActive?.toString() || "true");
      formData.append("position", values.position || "Home");
      formData.append("mediaType", mediaType);

      if (mode === "add") {
        if (desktopFileList.length > 0 && desktopFileList[0].originFileObj) {
          formData.append("imageFile", desktopFileList[0].originFileObj);
        }
        if (mobileFileList.length > 0 && mobileFileList[0].originFileObj) {
          formData.append("mobileImageFile", mobileFileList[0].originFileObj);
        }
        if (videoFileList.length > 0 && videoFileList[0].originFileObj) {
          formData.append("videoFile", videoFileList[0].originFileObj);
        }
        if (mobileVideoFileList.length > 0 && mobileVideoFileList[0].originFileObj) {
          formData.append("mobileVideoFile", mobileVideoFileList[0].originFileObj);
        }

        const success = await createBanner(formData);
        if (success) {
          navigate(`/${PageEnum.Banners}`);
        }
      } else if (mode === "edit" && id) {
        if (desktopFileList.length > 0 && !desktopFileList[0].originFileObj && desktopFileList[0].url) {
          const url = desktopFileList[0].url.replace(BASE_URL || "", "");
          formData.append("imageUrl", url);
        }
        if (mobileFileList.length > 0 && !mobileFileList[0].originFileObj && mobileFileList[0].url) {
          const url = mobileFileList[0].url.replace(BASE_URL || "", "");
          formData.append("mobileImageUrl", url);
        }

        if (videoFileList.length > 0 && !videoFileList[0].originFileObj && videoFileList[0].url) {
          const url = videoFileList[0].url.replace(BASE_URL || "", "");
          formData.append("videoUrl", url);
        }
        if (mobileVideoFileList.length > 0 && !mobileVideoFileList[0].originFileObj && mobileVideoFileList[0].url) {
          const url = mobileVideoFileList[0].url.replace(BASE_URL || "", "");
          formData.append("mobileVideoUrl", url);
        }

        if (desktopFileList.length > 0 && desktopFileList[0].originFileObj) {
          formData.append("imageFile", desktopFileList[0].originFileObj);
        }
        if (mobileFileList.length > 0 && mobileFileList[0].originFileObj) {
          formData.append("mobileImageFile", mobileFileList[0].originFileObj);
        }

        if (videoFileList.length > 0 && videoFileList[0].originFileObj) {
          formData.append("videoFile", videoFileList[0].originFileObj);
        }
        if (mobileVideoFileList.length > 0 && mobileVideoFileList[0].originFileObj) {
          formData.append("mobileVideoFile", mobileVideoFileList[0].originFileObj);
        }

        const success = await updateBanner(parseInt(id), formData);
        if (success) {
          navigate(`/${PageEnum.Banners}`);
        }
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const titleMap = {
    add: t("common.add") + " Banner",
    edit: t("common.edit") + " Banner",
    view: t("common.view") + " Banner",
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { title: <a href={`/${PageEnum.Banners}`}>{t("menu.bannerManagement") || "Banner Management"}</a> },
          { title: titleMap[mode] },
        ]}
        className="mb-4"
      />

      <Card
        title={
          <div className="flex items-center gap-2">
            <CoreButton
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/${PageEnum.Banners}`)}
              variant="text"
            />
            <span>{titleMap[mode]}</span>
          </div>
        }
        extra={
          mode !== "view" && (
            <div className="flex gap-2">
              <CoreButton onClick={() => navigate(`/${PageEnum.Banners}`)} variant="outlined">
                {t("common.cancel")}
              </CoreButton>
              <CoreButton onClick={handleSubmit} type="primary" loading={loading}>
                {mode === "add" ? t("common.add") : t("common.save")}
              </CoreButton>
            </div>
          )
        }
      >
        <Form
          form={form}
          layout="vertical"
          disabled={mode === "view"}
          onValuesChange={(changedValues) => {
            if (changedValues.mediaType) {
              setMediaType(changedValues.mediaType);
            }
          }}
          initialValues={{ textPosition: "Left", showOverlay: true, bannerType: "Hero", isActive: true, sortOrder: 0, mediaType: "Image", position: "Home_Hero" }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="title" label={t("dataTable.title")} rules={[{ required: true }]}>
                <CoreInput />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subtitle" label={t("dataTable.subtitle")}>
                <CoreInput />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label={t("common.description")}>
                <CoreTextArea rows={3} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="bannerType" label={t("dataTable.bannerType")} rules={[{ required: true }]}>
                <CoreSelect options={bannerTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="textPosition" label={t("dataTable.textPosition")} rules={[{ required: true }]}>
                <CoreSelect options={textPositionOptions} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="mediaType" label={"Media Type"} rules={[{ required: true }]}>
                <CoreSelect options={mediaTypeOptions} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="border-t pt-4 mb-2">
                <h4 className="font-semibold mb-3">{t("dataTable.image") || "Media"}</h4>
              </div>
            </Col>

            {mediaType === "Image" ? (
              <>
                <Col span={12}>
                  <Form.Item label={t("dataTable.desktopImage")}>
                    <CoreUpload
                      listType="picture-card"
                      maxCount={1}
                      fileList={desktopFileList}
                      onChange={({ fileList }) => setDesktopFileList(fileList)}
                      disabled={mode === "view"}
                    >
                      {desktopFileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                        </div>
                      )}
                    </CoreUpload>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label={t("dataTable.mobileImage")}>
                    <CoreUpload
                      listType="picture-card"
                      maxCount={1}
                      fileList={mobileFileList}
                      onChange={({ fileList }) => setMobileFileList(fileList)}
                      disabled={mode === "view"}
                    >
                      {mobileFileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                        </div>
                      )}
                    </CoreUpload>
                  </Form.Item>
                </Col>
              </>
            ) : (
              <>
                <Col span={12}>
                  <Form.Item label={"Desktop Video"}>
                    <CoreUpload
                      listType="picture-card"
                      maxCount={1}
                      accept="video/*"
                      fileList={videoFileList}
                      onChange={({ fileList }) => setVideoFileList(fileList)}
                      disabled={mode === "view"}
                    >
                      {videoFileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                        </div>
                      )}
                    </CoreUpload>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label={"Mobile Video"}>
                    <CoreUpload
                      listType="picture-card"
                      maxCount={1}
                      accept="video/*"
                      fileList={mobileVideoFileList}
                      onChange={({ fileList }) => setMobileVideoFileList(fileList)}
                      disabled={mode === "view"}
                    >
                      {mobileVideoFileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                        </div>
                      )}
                    </CoreUpload>
                  </Form.Item>
                </Col>
              </>
            )}

            <Col span={24}>
              <div className="border-t pt-4 mb-2">
                <h4 className="font-semibold mb-3">{t("dataTable.ctaButtons")}</h4>
              </div>
            </Col>

            <Col span={12}>
              <Form.Item name="buttonText" label={t("dataTable.mainButtonText")}>
                <CoreInput placeholder={t("dataTable.placeholder.viewNow")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="buttonLink" label={t("dataTable.mainButtonLink")}>
                <CoreInput placeholder={t("dataTable.placeholder.linkExample")} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="buttonText2" label={t("dataTable.subButtonText")}>
                <CoreInput placeholder={t("dataTable.placeholder.learnMore")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="buttonLink2" label={t("dataTable.subButtonLink")}>
                <CoreInput placeholder={t("dataTable.placeholder.linkExample")} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="border-t pt-4 mb-2">
                <h4 className="font-semibold mb-3">{t("dataTable.displaySettings")}</h4>
              </div>
            </Col>

            <Col span={8}>
              <Form.Item name="link" label={t("dataTable.bannerLink")}>
                <CoreInput placeholder={t("dataTable.placeholder.bannerClickUrl")} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="position" label={t("dataTable.displayPosition")} rules={[{ required: true }]}>
                <CoreSelect options={positionOptions} placeholder={t("dataTable.placeholder.selectPosition") || "Select position"} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label={t("common.sortBy") || "Sort Order"}>
                <CoreInput type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="showOverlay" label={t("dataTable.showOverlay")} valuePropName="checked">
                <CoreSwitch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label={t("common.status")} valuePropName="checked">
                <CoreSwitch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default BannerForm;
