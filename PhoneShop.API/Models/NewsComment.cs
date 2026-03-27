namespace PhoneShop.API.Models
{
    public class NewsComment
    {
        public int Id { get; set; }
        public int NewsId { get; set; }
        public News? News { get; set; }

        public string UserId { get; set; } = string.Empty; // FK -> AspNetUsers

        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
